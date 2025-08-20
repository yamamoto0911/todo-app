import React, { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodo }),
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([todo, ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
    setLoading(false);
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed: !completed } : todo
        ));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (id: number, title: string) => {
    setEditingId(id);
    setEditingText(title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async (id: number) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingText }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ));
        setEditingId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO App</h1>
        
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <p>No todos yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                />
                {editingId === todo.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(todo.id)}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span className="todo-title" onDoubleClick={() => startEditing(todo.id, todo.title)}>
                      {todo.title}
                    </span>
                    <button 
                      onClick={() => startEditing(todo.id, todo.title)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </>
                )}
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
