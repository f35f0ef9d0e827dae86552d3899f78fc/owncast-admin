import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import { Button } from 'antd';
import { fetchData, FEDERATION_MESSAGE_SEND } from '../../utils/apis';

// Might as well use the same rules as Mastodon since
// they are going to be the biggest game in town with
// regards to viewing these posts.
// https://docs.joinmastodon.org/spec/activitypub/#sanitization
const disable = [
  'replacements',
  'smartquotes',
  'table',
  'fence',
  'blockquote',
  'hr',
  'list',
  'reference',
  'heading',
  'lheading',
  'html_block',
  'escape',
  'strikethrough',
  'image',
  'html_inline',
  'entity',
  'backticks',
  'emphasis',
];
const enable = [
  'normalize',
  'block',
  'inline',
  'linkify',
  'autolink',
  'link',
  'paragraph',
  'text',
  'newline',
];

const mdParser = new MarkdownIt('zero', {
  html: false,
  breaks: true,
  linkify: true,
})
  .disable(disable)
  .enable(enable);
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

export default function PostFederatedMessage() {
  const [content, setContent] = useState('');

  function handleEditorChange({ text }) {
    // TODO: Add character limit counter to 500 or something.
    setContent(text);
  }

  async function sendButtonClicked() {
    alert(content);
    const data = {
      value: content,
    };
    try {
      await fetchData(FEDERATION_MESSAGE_SEND, {
        data,
        method: 'POST',
        auth: true,
      });
      // return result.success;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  return (
    <div>
      Form for posting a fediverse message goes here.
      <MdEditor
        placeholder="Type your social post to send to the Fediverse here. Very limited Markdown is supported. Not all Fediverse services will display all formatting."
        style={{ height: '20vh' }}
        value={content}
        renderHTML={(c: string) => mdParser.render(c)}
        onChange={handleEditorChange}
        view={{ menu: false }}
        config={{
          htmlClass: 'markdown-editor-preview-pane',
          markdownClass: 'markdown-editor-pane',
        }}
      />
      <Button type="primary" onClick={sendButtonClicked}>
        Post to Fediverse
      </Button>
    </div>
  );
}
