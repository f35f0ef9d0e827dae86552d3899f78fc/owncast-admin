import { Typography } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { TEXTFIELD_TYPE_TEXTAREA, TEXTFIELD_TYPE_URL } from '../components/config/form-textfield';
import TextFieldWithSubmit from '../components/config/form-textfield-with-submit';
import ToggleSwitch from '../components/config/form-toggleswitch';

import { UpdateArgs } from '../types/config-section';
import {
  FIELD_PROPS_ENABLE_FEDERATION,
  TEXTFIELD_PROPS_FEDERATION_LIVE_MESSAGE,
  TEXTFIELD_PROPS_FEDERATION_DEFAULT_USER,
  FIELD_PROPS_FEDERATION_IS_PRIVATE,
  FIELD_PROPS_SHOW_FEDERATION_ENGAGEMENT,
  TEXTFIELD_PROPS_INSTANCE_URL,
  postConfigUpdateToAPI,
} from '../utils/config-constants';
import { ServerStatusContext } from '../utils/server-status-context';

export default function ConfigFederation() {
  const { Title } = Typography;
  const [formDataValues, setFormDataValues] = useState(null);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig } = serverStatusData || {};

  const { federation, yp } = serverConfig;
  const { enabled, isPrivate, username, goLiveMessage, showEngagement } = federation;
  const { instanceUrl } = yp;

  const handleFieldChange = ({ fieldName, value }: UpdateArgs) => {
    setFormDataValues({
      ...formDataValues,
      [fieldName]: value,
    });
  };

  // if instanceUrl is empty, we should also turn OFF the `enabled` field of directory.
  const handleSubmitInstanceUrl = () => {
    if (formDataValues.instanceUrl === '') {
      if (enabled === true) {
        postConfigUpdateToAPI({
          apiPath: FIELD_PROPS_ENABLE_FEDERATION.apiPath,
          data: { value: false },
        });
        setFormDataValues({
          enabled: false,
        });
      }
    }
  };

  useEffect(() => {
    setFormDataValues({
      enabled,
      isPrivate,
      username,
      goLiveMessage,
      showEngagement,
      instanceUrl: yp.instanceUrl,
    });
  }, [serverConfig, yp]);

  if (!formDataValues) {
    return null;
  }

  const hasInstanceUrl = instanceUrl !== '';

  return (
    <div className="config-server-details-form">
      <Title>Federation Settings</Title>
      Explain what the Fediverse is here and talk about what happens if you were to enable this
      feature.
      <div className="form-module config-server-details-container">
        <ToggleSwitch
          fieldName="enabled"
          {...FIELD_PROPS_ENABLE_FEDERATION}
          checked={formDataValues.enabled}
          disabled={!hasInstanceUrl}
        />
        <TextFieldWithSubmit
          fieldName="instanceUrl"
          {...TEXTFIELD_PROPS_INSTANCE_URL}
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
          required
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
        <br />
        <br />
      </div>
    </div>
  );
}
