const API_URL = '/api';

class ApiService {
  async getBoard() {
    const response = await fetch(`${API_URL}/board`);
    if (!response.ok) throw new Error('Failed to fetch board');
    return response.json();
  }

  async createColumn(data) {
    const response = await fetch(`${API_URL}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create column');
    return response.json();
  }

  async createTask(data) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  }

  async updateTaskOrder(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update task order');
  }

  async bulkUpdateTasks(tasks) {
    const response = await fetch(`${API_URL}/tasks/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) throw new Error('Failed to bulk update tasks');
  }

  async reorderColumnTasks(columnId, taskOrders) {
    const response = await fetch(`${API_URL}/columns/${columnId}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskOrders }),
    });
    if (!response.ok) throw new Error('Failed to reorder column tasks');
  }
}

export default new ApiService();