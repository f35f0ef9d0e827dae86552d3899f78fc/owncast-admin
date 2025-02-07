import { Typography } from 'antd';
import React from 'react';
import EditStorage from '../components/config/edit-storage';

const { Title } = Typography;

export default function ConfigStorageInfo() {
  return (
    <>
      <Title>Storage</Title>
      <p className="description">
        Owncast supports optionally using external storage providers to stream your video. Learn
        more about this by visiting our{' '}
        <a
          href="https://owncast.online/docs/storage/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          Storage Documentation
        </a>
        .
      </p>
      <p className="description">
        Configuring this incorrectly will likely cause your video to be unplayable. Double check the
        documentation for your storage provider on how to configure the bucket you created for
        Owncast.
      </p>
      <p className="description">
        Keep in mind this is for live streaming, not for archival, recording or VOD purposes.
      </p>
      <EditStorage />
    </>
  );
}
