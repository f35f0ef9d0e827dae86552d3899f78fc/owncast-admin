import { Typography, Modal, Button, Row, Col } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TEXTFIELD_TYPE_TEXTAREA, TEXTFIELD_TYPE_URL } from '../components/config/form-textfield';
import TextFieldWithSubmit from '../components/config/form-textfield-with-submit';
import ToggleSwitch from '../components/config/form-toggleswitch';
import EditValueArray from '../components/config/edit-string-array';
import { UpdateArgs } from '../types/config-section';
import {
  FIELD_PROPS_ENABLE_FEDERATION,
  TEXTFIELD_PROPS_FEDERATION_LIVE_MESSAGE,
  TEXTFIELD_PROPS_FEDERATION_DEFAULT_USER,
  FIELD_PROPS_FEDERATION_IS_PRIVATE,
  FIELD_PROPS_SHOW_FEDERATION_ENGAGEMENT,
  TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL,
  FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS,
  postConfigUpdateToAPI,
  RESET_TIMEOUT,
  API_FEDERATION_BLOCKED_DOMAINS,
} from '../utils/config-constants';
import { ServerStatusContext } from '../utils/server-status-context';
import { createInputStatus, STATUS_ERROR, STATUS_SUCCESS } from '../utils/input-statuses';

function FederationInfoModal({ cancelPressed, okPressed }) {
  return (
    <Modal
      width={800}
      title="Enable Federation"
      visible
      onCancel={cancelPressed}
      footer={<Button onClick={okPressed}>I Understand.</Button>}
    >
      <Typography.Title level={3}>What is Federation?</Typography.Title>

      <Typography.Paragraph>
        Enabling Federation allows your Owncast server to be a part of the greater{' '}
        <a href="https://en.wikipedia.org/wiki/Fediverse" rel="noopener noreferrer" target="_blank">
          Fediverse
        </a>
        , allowing people to be notified when you go live and for you to send posts from Owncast to
        your followers. It can also surface actions taken on the Fediverse such as following,
        sharing or liking to show who is engaging with your stream.
      </Typography.Paragraph>

      <Typography.Title level={3}>Understand the following</Typography.Title>
      <Typography.Paragraph>
        Due to other servers interacting with yours there are some things to keep in mind.
      </Typography.Paragraph>
      <ul>
        <li>You must always host your Owncast server with SSL using a https url.</li>
        <li>
          If you ever change your server name or Fediverse username you will be seen as a completely
          different user on the Fediverse, and the old user will disappear. It is best to never
          change these once you set them.
        </li>
        <li>
          Turning on Private Federation mode will require you to manually approve each follower.
        </li>
      </ul>
    </Modal>
  );
}

FederationInfoModal.propTypes = {
  cancelPressed: PropTypes.func.isRequired,
  okPressed: PropTypes.func.isRequired,
};

export default function ConfigFederation() {
  const { Title } = Typography;
  const [formDataValues, setFormDataValues] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig, setFieldInConfigState } = serverStatusData || {};
  const [blockedDomainSaveState, setBlockedDomainSaveState] = useState(null);

  const { federation, yp } = serverConfig;
  const { enabled, isPrivate, username, goLiveMessage, showEngagement, blockedDomains } =
    federation;
  const { instanceUrl } = yp;

  const handleFieldChange = ({ fieldName, value }: UpdateArgs) => {
    setFormDataValues({
      ...formDataValues,
      [fieldName]: value,
    });
  };

  const handleEnabledSwitchChange = (value: boolean) => {
    if (!value) {
      setFormDataValues({
        enabled: false,
      });
    } else {
      setIsInfoModalOpen(true);
    }
  };

  // if instanceUrl is empty, we should also turn OFF the `enabled` field of directory.
  const handleSubmitInstanceUrl = () => {
    const hasInstanceUrl = formDataValues.instanceUrl !== '';
    const isInstanceUrlSecure = formDataValues.instanceUrl.startsWith('https://');

    if (!hasInstanceUrl || !isInstanceUrlSecure) {
      postConfigUpdateToAPI({
        apiPath: FIELD_PROPS_ENABLE_FEDERATION.apiPath,
        data: { value: false },
      });
      setFormDataValues({
        enabled: false,
      });
    }
  };

  function federationInfoModalCancelPressed() {
    setIsInfoModalOpen(false);
    setFormDataValues({
      enabled: false,
    });
  }

  function federationInfoModalOkPressed() {
    setIsInfoModalOpen(false);
    setFormDataValues({
      enabled: true,
    });
  }

  function resetBlockedDomainsSaveState() {
    setBlockedDomainSaveState(null);
  }

  function saveBlockedDomains() {
    try {
      postConfigUpdateToAPI({
        apiPath: API_FEDERATION_BLOCKED_DOMAINS,
        data: { value: formDataValues.blockedDomains },
        onSuccess: () => {
          setFieldInConfigState({
            fieldName: 'forbiddenUsernames',
            value: formDataValues.forbiddenUsernames,
          });
          setBlockedDomainSaveState(STATUS_SUCCESS);
          setTimeout(resetBlockedDomainsSaveState, RESET_TIMEOUT);
        },
        onError: (message: string) => {
          setBlockedDomainSaveState(createInputStatus(STATUS_ERROR, message));
          setTimeout(resetBlockedDomainsSaveState, RESET_TIMEOUT);
        },
      });
    } catch (e) {
      console.error(e);
      setBlockedDomainSaveState(STATUS_ERROR);
    }
  }

  function handleDeleteBlockedDomain(index: number) {
    formDataValues.blockedDomains.splice(index, 1);
    saveBlockedDomains();
  }

  function handleCreateBlockedDomain(domain: string) {
    let newDomain;
    try {
      const u = new URL(domain);
      newDomain = u.host;
    } catch (_) {
      newDomain = domain;
    }

    formDataValues.blockedDomains.push(newDomain);
    handleFieldChange({
      fieldName: 'blockedDomains',
      value: formDataValues.blockedDomains,
    });
    saveBlockedDomains();
  }

  useEffect(() => {
    setFormDataValues({
      enabled,
      isPrivate,
      username,
      goLiveMessage,
      showEngagement,
      blockedDomains,
      instanceUrl: yp.instanceUrl,
    });
  }, [serverConfig, yp]);

  if (!formDataValues) {
    return null;
  }

  const hasInstanceUrl = instanceUrl !== '';
  const isInstanceUrlSecure = instanceUrl.startsWith('https://');

  return (
    <div>
      <Title>Federation Settings</Title>
      Explain what the Fediverse is here and talk about what happens if you were to enable this
      feature.
      <Row>
        <Col span={15} className="form-module" style={{ marginRight: '15px' }}>
          <ToggleSwitch
            fieldName="enabled"
            onChange={handleEnabledSwitchChange}
            {...FIELD_PROPS_ENABLE_FEDERATION}
            checked={formDataValues.enabled}
            disabled={!hasInstanceUrl || !isInstanceUrlSecure}
          />
          <TextFieldWithSubmit
            fieldName="instanceUrl"
            {...TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL}
            value={formDataValues.instanceUrl}
            initialValue={yp.instanceUrl}
            type={TEXTFIELD_TYPE_URL}
            onChange={handleFieldChange}
            onSubmit={handleSubmitInstanceUrl}
          />

          <ToggleSwitch
            fieldName="isPrivate"
            {...FIELD_PROPS_FEDERATION_IS_PRIVATE}
            checked={formDataValues.isPrivate}
          />
          <TextFieldWithSubmit
            required
            fieldName="username"
            {...TEXTFIELD_PROPS_FEDERATION_DEFAULT_USER}
            value={formDataValues.username}
            initialValue={username}
            onChange={handleFieldChange}
          />
          <TextFieldWithSubmit
            fieldName="goLiveMessage"
            {...TEXTFIELD_PROPS_FEDERATION_LIVE_MESSAGE}
            type={TEXTFIELD_TYPE_TEXTAREA}
            value={formDataValues.goLiveMessage}
            initialValue={goLiveMessage}
            onChange={handleFieldChange}
          />
          <ToggleSwitch
            fieldName="showEngagement"
            {...FIELD_PROPS_SHOW_FEDERATION_ENGAGEMENT}
            checked={formDataValues.showEngagement}
          />
        </Col>
        <Col span={8} className="form-module">
          <EditValueArray
            title={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.label}
            placeholder={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.placeholder}
            description={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.tip}
            values={formDataValues.blockedDomains}
            handleDeleteIndex={handleDeleteBlockedDomain}
            handleCreateString={handleCreateBlockedDomain}
            submitStatus={createInputStatus(blockedDomainSaveState)}
          />
        </Col>
      </Row>
      {isInfoModalOpen && (
        <FederationInfoModal
          cancelPressed={federationInfoModalCancelPressed}
          okPressed={federationInfoModalOkPressed}
        />
      )}
    </div>
  );
}
