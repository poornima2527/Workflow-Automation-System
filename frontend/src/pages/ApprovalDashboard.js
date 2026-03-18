import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message,
  Tag,
  Space,
  Descriptions,
  Timeline
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { approvalAPI } from '../services/api';
import moment from 'moment';

const { TextArea } = Input;

const ApprovalDashboard = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [form] = Form.useForm();

  // Mock user ID - in real app, this would come from authentication
  const [currentUserId, setCurrentUserId] = useState('manager@company.com');
  const [userRole, setUserRole] = useState('Manager');

  useEffect(() => {
    fetchPendingApprovals();
  }, [currentUserId]);

  const handleUserChange = (userId, role) => {
    setCurrentUserId(userId);
    setUserRole(role);
  };

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await approvalAPI.getPendingApprovals(currentUserId);
      setPendingApprovals(response.data);
    } catch (error) {
      message.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setDetailModalVisible(true);
  };

  const handleApprove = (approval) => {
    setSelectedApproval(approval);
    setActionType('approve');
    setActionModalVisible(true);
  };

  const handleReject = (approval) => {
    setSelectedApproval(approval);
    setActionType('reject');
    setActionModalVisible(true);
  };

  const handleActionSubmit = async (values) => {
    try {
      setLoading(true);
      const actionData = {
        userId: currentUserId,
        comments: values.comments,
        ...(actionType === 'reject' && { reason: values.reason })
      };

      if (actionType === 'approve') {
        await approvalAPI.approveExecution(selectedApproval.id, actionData);
        message.success('Workflow approved successfully');
      } else {
        await approvalAPI.rejectExecution(selectedApproval.id, actionData);
        message.success('Workflow rejected');
      }

      setActionModalVisible(false);
      form.resetFields();
      fetchPendingApprovals();
    } catch (error) {
      message.error(`Failed to ${actionType} workflow: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Execution ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Workflow ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Employee Name',
      key: 'employee_name',
      width: 150,
      render: (_, record) => record.data?.employee_name || 'N/A'
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 100,
      render: (_, record) => record.data?.amount || 'N/A'
    },
    {
      title: 'Department',
      key: 'department',
      width: 120,
      render: (_, record) => record.data?.department || 'N/A'
    },
    {
      title: 'Started',
      dataIndex: 'started_at',
      key: 'started_at',
      width: 150,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ];

  const renderApprovalDetail = () => {
    if (!selectedApproval) return null;

    const currentLog = selectedApproval.logs.find(log => 
      log.step_type === 'approval' && 
      log.status === 'in_progress'
    );

    return (
      <div>
        <Descriptions title="Execution Details" bordered column={2}>
          <Descriptions.Item label="Execution ID">{selectedApproval.id}</Descriptions.Item>
          <Descriptions.Item label="Workflow ID">{selectedApproval.workflow_id}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="processing">{selectedApproval.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Started">
            {moment(selectedApproval.started_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        <Card title="Input Data" size="small" style={{ marginTop: 16 }}>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(selectedApproval.data, null, 2)}
          </pre>
        </Card>

        {currentLog && (
          <Card title="Current Approval Step" size="small" style={{ marginTop: 16 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Step Name">{currentLog.step_name}</Descriptions.Item>
              <Descriptions.Item label="Step Type">{currentLog.step_type}</Descriptions.Item>
              <Descriptions.Item label="Approver">{currentLog.approver_id}</Descriptions.Item>
              <Descriptions.Item label="Started">
                {moment(currentLog.started_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card title="Execution Timeline" size="small" style={{ marginTop: 16 }}>
          <Timeline>
            {selectedApproval.logs.map((log, index) => (
              <Timeline.Item
                key={index}
                color={
                  log.status === 'completed' ? 'green' :
                  log.status === 'failed' ? 'red' :
                  log.status === 'in_progress' ? 'blue' : 'gray'
                }
              >
                <div>
                  <strong>{log.step_name}</strong> ({log.step_type})
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    {moment(log.started_at).format('HH:mm:ss')} - 
                    {log.ended_at ? moment(log.ended_at).format('HH:mm:ss') : 'Running'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={
                      log.status === 'completed' ? 'success' :
                      log.status === 'failed' ? 'error' :
                      log.status === 'in_progress' ? 'processing' : 'default'
                    }>
                      {log.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Approval Dashboard</h1>
            <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
              Review and approve pending workflow executions
            </p>
          </div>
          <div>
            <Space>
              <span style={{ marginRight: 8, fontWeight: 500 }}>Viewing as:</span>
              <Button.Group>
                <Button 
                  type={currentUserId === 'manager@company.com' ? 'primary' : 'default'}
                  onClick={() => handleUserChange('manager@company.com', 'Manager')}
                >
                  Manager
                </Button>
                <Button 
                  type={currentUserId === 'finance@company.com' ? 'primary' : 'default'}
                  onClick={() => handleUserChange('finance@company.com', 'Finance')}
                >
                  Finance
                </Button>
              </Button.Group>
            </Space>
          </div>
        </div>
      </div>
      
      <Card className="workflow-card">
        <Table
          columns={columns}
          dataSource={pendingApprovals}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} pending approvals`
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Execution Details"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {renderApprovalDetail()}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Workflow`}
        visible={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleActionSubmit}
        >
          <Form.Item
            label="Comments"
            name="comments"
            rules={[{ required: true, message: 'Please provide comments' }]}
          >
            <TextArea rows={4} placeholder="Enter your comments..." />
          </Form.Item>

          {actionType === 'reject' && (
            <Form.Item
              label="Rejection Reason"
              name="reason"
              rules={[{ required: true, message: 'Please provide rejection reason' }]}
            >
              <TextArea rows={3} placeholder="Enter the reason for rejection..." />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalDashboard;
