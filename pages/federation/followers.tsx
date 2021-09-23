import React, { useEffect, useState } from 'react';
import { Table, Avatar, Typography, Button } from 'antd';
import { ColumnsType, SortOrder } from 'antd/lib/table/interface';
import format from 'date-fns/format';
import { UserAddOutlined } from '@ant-design/icons';
import { FOLLOWERS, FOLLOWERS_PENDING, FOLLOWER_APPROVE, fetchData } from '../../utils/apis';
import { isEmptyObject } from '../../utils/format';

const { Title } = Typography;

export interface Follower {
  link: string;
  account: string;
  image: string;
  createdAt: Date;
  approved: Date;
}

export default function FediverseFollowers() {
  const [followersPending, setFollowersPending] = useState<Follower[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);

  const getFollowers = async () => {
    try {
      const followersResult = await fetchData(FOLLOWERS, { auth: false });
      if (isEmptyObject(followersResult.followers)) {
        setFollowers([]);
      } else {
        setFollowers(followersResult.followers);
      }

      const pendingFollowersResult = await fetchData(FOLLOWERS_PENDING, { auth: true });
      if (isEmptyObject(pendingFollowersResult)) {
        setFollowersPending([]);
      } else {
        setFollowersPending(pendingFollowersResult);
      }
    } catch (error) {
      console.log('==== error', error);
    }
  };

  useEffect(() => {
    getFollowers();
  }, []);

  const columns: ColumnsType<Follower> = [
    {
      title: '',
      dataIndex: 'image',
      key: 'image',
      width: 90,
      render: image => <Avatar size={40} src={image} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Account',
      dataIndex: 'username',
      key: 'username',
      render: (_, follower) => (
        <a href={follower.link} target="_blank" rel="noreferrer">
          {follower.link}
        </a>
      ),
    },
  ];

  function makeTable(data: Follower[], tableColumns: ColumnsType<Follower>) {
    return (
      <Table
        dataSource={data}
        columns={tableColumns}
        size="small"
        rowKey={row => row.link}
        pagination={{ pageSize: 20 }}
        // onRow={(record, rowIndex) => ({
        //   onClick: event => {
        //     window.open(record.link);
        //   },
        // })}
      />
    );
  }

  async function approveFollowRequest(request) {
    console.log('approve', request);
    try {
      await fetchData(FOLLOWER_APPROVE, {
        auth: true,
        method: 'POST',
        data: {
          federationIRI: request.link,
          approved: true,
        },
      });

      // Refetch and update the current data.
      getFollowers();
    } catch (err) {
      console.error(err);
    }
  }

  const pendingColumns: ColumnsType<Follower> = [...columns];
  pendingColumns.unshift({
    title: 'Approve',
    dataIndex: null,
    key: null,
    render: request => (
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        size="large"
        onClick={() => {
          approveFollowRequest(request);
        }}
      />
    ),
    width: 50,
  });
  pendingColumns.push({
    title: 'Requested',
    dataIndex: 'createdAt',
    key: 'requested',
    width: 200,
    render: timestamp => {
      const dateObject = new Date(timestamp);
      return <>{format(dateObject, 'P')}</>;
    },
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    sortDirections: ['descend', 'ascend'] as SortOrder[],
    defaultSortOrder: 'descend' as SortOrder,
  });
  const pendingFollowView = followersPending.length > 0 && (
    <>
      <Title>Followers needing Approval</Title>
      <p>
        The following people are requesting to follow your Owncast server on the{' '}
        <a href="https://en.wikipedia.org/wiki/Fediverse" target="_blank" rel="noopener noreferrer">
          Fediverse
        </a>{' '}
        and be alerted to when you go live.
      </p>
      {makeTable(followersPending, pendingColumns)}
    </>
  );

  const followersColumns: ColumnsType<Follower> = [...columns];
  followersColumns.push({
    title: 'Added',
    dataIndex: 'followed',
    key: 'followed',
    width: 200,
    render: timestamp => {
      const dateObject = new Date(timestamp);
      return <>{format(dateObject, 'P')}</>;
    },
    sorter: (a, b) => new Date(a.approved).getTime() - new Date(b.approved).getTime(),
    sortDirections: ['descend', 'ascend'] as SortOrder[],
    defaultSortOrder: 'descend' as SortOrder,
  });

  return (
    <div className="followers-section">
      {pendingFollowView}

      <Title>Followers</Title>
      <p>
        The following accounts get notified on the{' '}
        <a href="https://en.wikipedia.org/wiki/Fediverse" target="_blank" rel="noopener noreferrer">
          Fediverse
        </a>{' '}
        when you go live.
      </p>
      {makeTable(followers, followersColumns)}
    </div>
  );
}
