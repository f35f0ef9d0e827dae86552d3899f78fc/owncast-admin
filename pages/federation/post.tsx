import React, { useState } from 'react';

import { Button, Space, Input } from 'antd';
import { STATUS_ERROR, STATUS_SUCCESS } from '../../utils/input-statuses';
import { fetchData, FEDERATION_MESSAGE_SEND } from '../../utils/apis';
import { RESET_TIMEOUT } from '../../utils/config-constants';

const { TextArea } = Input;

export default function PostFederatedMessage() {
  const [content, setContent] = useState('');
  const [postPending, setPostPending] = useState(false);
  const [postSuccessState, setPostSuccessState] = useState(null);

  function handleEditorChange(e) {
    setContent(e.target.value);
  }

  function resetPostSucessState() {
    setPostSuccessState(null);
  }

  async function sendButtonClicked() {
    setPostPending(true);

    const data = {
      value: content,
    };
    try {
      await fetchData(FEDERATION_MESSAGE_SEND, {
        data,
        method: 'POST',
        auth: true,
      });
      setPostSuccessState(STATUS_SUCCESS);
      setTimeout(resetPostSucessState, RESET_TIMEOUT);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setPostSuccessState(STATUS_ERROR);
    }

    setPostPending(false);
  }

  return (
    <Space id="fediverse-post-container" direction="vertical">
      You can send a post to your followers.
      <TextArea
        size="large"
        showCount
        maxLength={500}
        onChange={handleEditorChange}
        id="fediverse-post-input"
      />
      <Button type="primary" onClick={sendButtonClicked} disabled={postPending || postSuccessState}>
        {postSuccessState?.toUpperCase() || 'Post to Fediverse'}
      </Button>
    </Space>
  );
}
