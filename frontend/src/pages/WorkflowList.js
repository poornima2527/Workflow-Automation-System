import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  message,
  Popconfirm,
  Pagination,
  Form,
  Select,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  SearchOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchWorkflows = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        ...(search && { search })
      };
      const response = await workflowAPI.getWorkflows(params);
      
      setWorkflows(response.data.workflows);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.data.total
      }));
    } catch (error) {
      message.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    fetchWorkflows(1, value);
  };

  const handlePageChange = (page, pageSize) => {
    fetchWorkflows(page, searchText);
  };

  const handleDelete = async (id) => {
    try {
      const workflow = workflows.find(w => w.id === id);
      Modal.confirm({
        title: 'Delete Workflow',
        content: `Are you sure you want to delete "${workflow?.name}"? This action cannot be undone.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          await workflowAPI.deleteWorkflow(id);
          message.success('Workflow deleted successfully');
          fetchWorkflows(pagination.current, searchText);
        }
      });
    } catch (error) {
      message.error('Failed to delete workflow');
    }
  };

  const handleAddSampleWorkflow = async () => {
    try {
      setLoading(true);
      const sampleWorkflow = {
        name: `Sample Workflow ${Date.now()}`,
        input_schema: {
          amount: { type: "number", required: true },
          description: { type: "string", required: false }
        },
        is_active: true
      };

      console.log('Creating workflow:', sampleWorkflow);
      const response = await workflowAPI.createWorkflow(sampleWorkflow);
      console.log('Response:', response);
      message.success('Sample workflow created successfully');
      fetchWorkflows(pagination.current, searchText);
    } catch (error) {
      console.error('Error creating sample workflow:', error);
      message.error('Failed to create sample workflow: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkflow = async (values) => {
    try {
      setLoading(true);
      
      // Validate JSON schema
      let inputSchema = {};
      if (values.input_schema) {
        try {
          inputSchema = JSON.parse(values.input_schema);
        } catch (e) {
          message.error('Invalid JSON in input schema');
          return;
        }
      }

      const workflowData = {
        name: values.name,
        input_schema: inputSchema,
        is_active: values.is_active !== undefined ? values.is_active : true
      };

      const response = await workflowAPI.createWorkflow(workflowData);
      message.success(`Workflow "${values.name}" created successfully`);
      setAddModalVisible(false);
      form.resetFields();
      fetchWorkflows(pagination.current, searchText);
    } catch (error) {
      message.error('Failed to create workflow: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      Modal.confirm({
        title: 'Bulk Delete Workflows',
        content: `Are you sure you want to delete ${selectedRowKeys.length} selected workflows? This action cannot be undone.`,
        okText: 'Delete All',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          setLoading(true);
          for (const id of selectedRowKeys) {
            await workflowAPI.deleteWorkflow(id);
          }
          message.success(`${selectedRowKeys.length} workflows deleted successfully`);
          setSelectedRowKeys([]);
          fetchWorkflows(pagination.current, searchText);
          setLoading(false);
        }
      });
    } catch (error) {
      message.error('Failed to delete some workflows');
      setLoading(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: 'Steps',
      key: 'step_count',
      width: 80,
      render: (_, record) => record.step_count || 0
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => (
        <span className={`status-badge ${isActive ? 'status-completed' : 'status-canceled'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
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
            icon={<EditOutlined />}
            onClick={() => navigate(`/workflows/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="default"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => navigate(`/execution?workflowId=${record.id}`)}
          >
            Execute
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Workflow Management</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: 16 }}>
          Create, manage, and automate your business workflows
        </p>
      </div>
      
      <Card className="workflow-card">
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search workflows..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
            className="modern-button"
          >
            Quick Add
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => navigate('/workflows/new')}
          >
            Advanced Create
          </Button>
          <Button
            type="dashed"
            onClick={handleAddSampleWorkflow}
            loading={loading}
          >
            Add Sample
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedRowKeys.length})
            </Button>
          )}
        </Space>

        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            loading={loading}
            pagination={false}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
          />
        </div>

        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={handlePageChange}
          style={{ marginTop: 16, textAlign: 'right' }}
        />
      </Card>

      {/* Quick Add Workflow Modal */}
      <Modal
        title="Quick Add Workflow"
        visible={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        className="workflow-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddWorkflow}
        >
          <Form.Item
            label="Workflow Name"
            name="name"
            rules={[{ required: true, message: 'Please input workflow name!' }]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>

          <Form.Item
            label="Input Schema (JSON)"
            name="input_schema"
            initialValue='{"amount": {"type": "number", "required": true}, "description": {"type": "string", "required": false}}'
          >
            <Input.TextArea
              rows={4}
              placeholder='{"amount": {"type": "number", "required": true}}'
            />
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch /> Enable this workflow
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowList;
