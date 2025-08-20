import React, { useState, useEffect } from 'react';
import './App.css';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Recommendations {
  insights: string[];
  suggestions: string[];
  stats: {
    totalTodos: number;
    completedTodos: number;
    pendingTodos: number;
    completionRate: number;
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    fetchTodos();
    fetchRecommendations();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
        fetchRecommendations(); // Update recommendations when todos change
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
        fetchRecommendations(); // Update recommendations
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
        fetchRecommendations(); // Update recommendations
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
        fetchRecommendations(); // Update recommendations
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
        fetchRecommendations(); // Update recommendations
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TODO App</h1>
        
        {recommendations && (
          <div className="recommendations-section">
            <button 
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="recommendations-toggle"
            >
              🤖 AI アシスタント {showRecommendations ? '▼' : '▶'}
            </button>
            
            {showRecommendations && (
              <div className="recommendations">
                <div className="stats">
                  <h3>📊 統計情報</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{recommendations.stats.totalTodos}</span>
                      <span className="stat-label">総タスク数</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{recommendations.stats.completedTodos}</span>
                      <span className="stat-label">完了済み</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{recommendations.stats.completionRate}%</span>
                      <span className="stat-label">完了率</span>
                    </div>
                  </div>
                </div>

                <div className="insights">
                  <h3>💡 分析結果</h3>
                  {recommendations.insights.map((insight, index) => (
                    <div key={index} className="insight-item">{insight}</div>
                  ))}
                </div>

                <div className="suggestions">
                  <h3>🎯 おすすめアクション</h3>
                  {recommendations.suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">{suggestion}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
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
