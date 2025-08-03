import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [task, setTask] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    const get_tasks = async () => {
      const url = '/tasks';
      try {
        const response = await axios.get(url);
        setError('');
        setPendingTasks(response.data.filter((item) => item.status === 'new'));
        setCompletedTasks(response.data.filter((item) => item.status === 'completed'));
      } catch (err) {
        setError(`Failed to load tasks: ${err.message}`);
      }
    };
    get_tasks();
  }, []);

  const handleTask = async (e) => {
    const id = e.target.dataset.id;
    const tasks = [...pendingTasks, ...completedTasks];
    const update_task_data = tasks.find((item) => item.id === +id);

    try {
      const response = await axios.put('/tasks', update_task_data);
      if (response.status == 200) {
        const { id, status } = response.data;
        setError('');
        if (status == 'completed') {
          setPendingTasks(pendingTasks.filter((item) => item.id !== id));
          setCompletedTasks([...completedTasks, response.data]);
        } else {
          setCompletedTasks(completedTasks.filter((item) => item.id !== id));
          setPendingTasks([...pendingTasks, response.data]);
        }
      }
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (task.trim()) {
      setError('');
      const url = '/tasks';
      try {
        const response = await axios.post(url, { name: task.trim(), status: 'new' });
        if (response.status == 201) {
          setPendingTasks([...pendingTasks, response.data]);
          setTask('');
        }
      } catch (err) {
        setError(`Failed to add task: ${err.message}`);
      }
    }
  };

  return (
    <div className="main">
      <h2 className="header">Todo List</h2>
      {error && <div className="error">{error}</div>}

      <div className="todo_task">
        <input
          value={task}
          type="text"
          placeholder="Enter Task"
          onChange={(e) => setTask(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <section className="tasks">
        {pendingTasks.length ? (
          <div className="pending_tasks">
            <h2 className="header">Pending Tasks</h2>
            <ul>
              {pendingTasks.map((item) => (
                <li key={item.id} data-id={item.id} onClick={(e) => handleTask(e)}>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {completedTasks.length ? (
          <div className="completed_tasks">
            <h2 className="header">Completed Tasks</h2>
            <ul>
              {completedTasks.map((item) => (
                <li key={item.id} data-id={item.id} onClick={(e) => handleTask(e)}>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default App;
