import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const workflowAPI = {
  getWorkflows: (params = {}) => api.get('/workflows', { params }),
  getWorkflow: (id) => api.get(`/workflows/${id}`),
  createWorkflow: (data) => api.post('/workflows', data),
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),
  executeWorkflow: (workflowId, data) => api.post(`/workflows/${workflowId}/execute`, data),
};

export const stepAPI = {
  getSteps: (workflowId) => api.get(`/workflows/${workflowId}/steps`),
  createStep: (workflowId, data) => api.post(`/workflows/${workflowId}/steps`, data),
  updateStep: (id, data) => api.put(`/steps/${id}`, data),
  deleteStep: (id) => api.delete(`/steps/${id}`),
};

export const ruleAPI = {
  getRules: (stepId) => api.get(`/steps/${stepId}/rules`),
  createRule: (stepId, data) => api.post(`/steps/${stepId}/rules`, data),
  updateRule: (id, data) => api.put(`/rules/${id}`, data),
  deleteRule: (id) => api.delete(`/rules/${id}`),
  validateCondition: (condition) => api.post('/validate-condition', { condition }),
};

export const executionAPI = {
  getExecutions: (params = {}) => api.get('/executions', { params }),
  getExecution: (id) => api.get(`/executions/${id}`),
  cancelExecution: (id) => api.post(`/executions/${id}/cancel`),
  retryExecution: (id) => api.post(`/executions/${id}/retry`),
};

export const approvalAPI = {
  getPendingApprovals: (userId) => api.get(`/approvals/pending/${userId}`),
  approveExecution: (executionId, data) => api.post(`/approvals/approve/${executionId}`, data),
  rejectExecution: (executionId, data) => api.post(`/approvals/reject/${executionId}`, data),
  getAllApprovals: () => api.get('/approvals'),
};

export default api;
