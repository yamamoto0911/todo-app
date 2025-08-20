import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'todoapp',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
});

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: Date;
}

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    const result = await pool.query(
      'UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed) WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Recommendations endpoint
app.get('/api/recommendations', async (req, res) => {
  try {
    const todosResult = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    const todos = todosResult.rows;
    
    const recommendations = generateRecommendations(todos);
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI recommendation logic
function generateRecommendations(todos: Todo[]) {
  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);
  const totalTodos = todos.length;
  const completionRate = totalTodos > 0 ? (completedTodos.length / totalTodos) * 100 : 0;

  const suggestions = [];
  const insights = [];

  // Completion rate insights
  if (completionRate > 80) {
    insights.push("🎉 素晴らしい！完了率が高く、生産性が優秀です");
    suggestions.push("新しいチャレンジングなタスクを追加してみましょう");
  } else if (completionRate > 50) {
    insights.push("👍 良いペースで進んでいます");
    suggestions.push("タスクを小さく分割すると完了しやすくなります");
  } else {
    insights.push("💪 まずは小さなタスクから始めてみましょう");
    suggestions.push("1日1つのタスク完了を目標にしてみてください");
  }

  // Pattern analysis
  const commonWords = findCommonWords(todos.map(todo => todo.title));
  if (commonWords.length > 0) {
    insights.push(`🔍 よく使われるキーワード: ${commonWords.slice(0, 3).join(', ')}`);
    suggestions.push(`"${commonWords[0]}"関連のタスクをまとめて処理すると効率的です`);
  }

  // Time-based suggestions
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 9 && hour <= 11) {
    suggestions.push("🌅 午前中は集中力が高い時間です。重要なタスクに取り組みましょう");
  } else if (hour >= 14 && hour <= 16) {
    suggestions.push("🌞 午後は軽めのタスクや整理作業がおすすめです");
  } else if (hour >= 20) {
    suggestions.push("🌙 夜は明日の準備や振り返りに適しています");
  }

  // Pending todos analysis
  if (pendingTodos.length > 10) {
    suggestions.push("📝 未完了タスクが多めです。優先度の高いものから順番に取り組みましょう");
  } else if (pendingTodos.length === 0) {
    suggestions.push("🎯 全てのタスクが完了しています！新しい目標を設定してみましょう");
  }

  return {
    insights,
    suggestions,
    stats: {
      totalTodos,
      completedTodos: completedTodos.length,
      pendingTodos: pendingTodos.length,
      completionRate: Math.round(completionRate)
    }
  };
}

function findCommonWords(titles: string[]): string[] {
  const wordCount: { [key: string]: number } = {};
  
  titles.forEach(title => {
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .map(([word, _]) => word);
}

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await initializeDatabase();
});