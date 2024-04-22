import './App.css';
import {useState, useEffect} from 'react'
import axios from 'axios'
import {saveAs} from 'file-saver'

function App() {
  const [projects, setProjects] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState(null); // Track the currently viewed project
  const [editedProjectTitle, setEditedProjectTitle] = useState(''); // State to track edited project title
  const [newTodoDescription, setNewTodoDescription] = useState(''); // State to track new todo description
  const [editTodoId, setEditTodoId] = useState(null); // State to track the todo being edited
  const [editedTodoDescription, setEditedTodoDescription] = useState(''); // State to track edited todo description

  const [summary, setSummary] = useState('Your summary here');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const exportSummaryAsGist = async (projectId) => {
    try {
      const project = projects.find(proj => proj.id === projectId);
      if (!project) {
        alert('Project not found.');
        return;
      }

      const { title, todos } = project;
      const totalTodos = todos.length;
      const completedTodos = todos.filter(todo => todo.completed).length;
      const pendingTodos = todos.filter(todo => !todo.completed);
      const completedTodoList = todos.filter(todo => todo.completed);

      // Generating markdown content
      let markdownContent = `# ${title}\n\n`;
      markdownContent += `**Summary:** ${completedTodos} / ${totalTodos} completed.\n\n`;

      if (pendingTodos.length > 0) {
        markdownContent += '## Pending Todos\n\n';
        pendingTodos.forEach(todo => {
          markdownContent += `- [ ] ${todo.description}\n`;
        });
        markdownContent += '\n';
      }

      if (completedTodoList.length > 0) {
        markdownContent += '## Completed Todos\n\n';
        completedTodoList.forEach(todo => {
          markdownContent += `- [x] ${todo.description}\n`;
        });
      }

      // Save markdown file locally
      const blob = new Blob([markdownContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${title}.md`);

      const gistData = {
        description: `${title} Summary`,
        public: false, // Make the gist secret
        files: {
          [`${title}.md`]: {
            content: markdownContent
          }
        }
      };

      const response = await axios.post('https://api.github.com/gists', gistData, {
        headers: {
          Authorization: `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`
        }
      });
      alert(`Summary exported successfully. Gist URL: ${response.data.html_url}`);
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Error exporting summary. Please try again.');
    }
  };

  const login = () => {
    // Simulating authentication - Replace this with actual authentication logic
    if (username === 'user' && password === 'password') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid username or password');
    }
    // Reset username and password fields after login attempt
    setUsername('');
    setPassword('');
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const createProject = (title) => {
    const newProject = {
      id: Date.now(),
      title: title,
      todos: []
    };
    setProjects([...projects, newProject]);
  };

  const viewProject = (projectId) => {
    setCurrentProjectId(projectId);
  };

  const saveEditedTitle = (projectId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, title: editedProjectTitle };
      }
      return project;
    });
    setProjects(updatedProjects);
    setCurrentProjectId(null); // Exit edit mode after saving
  };

  const addTodo = (projectId, description) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const newTodo = {
          id: Date.now(),
          description: description,
          date: new Date().toISOString().slice(0, 10),
          completed: false
        };
        project.todos.push(newTodo);
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const removeTodo = (todoId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === currentProjectId) {
        project.todos = project.todos.filter(todo => todo.id !== todoId);
      }
      return project;
    });
    setProjects(updatedProjects);
  };


  const toggleTodoStatus = (todoId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === currentProjectId) {
        project.todos = project.todos.map(todo => {
          if (todo.id === todoId) {
            return { ...todo, completed: !todo.completed };
          }
          return todo;
        });
      }
      return project;
    });
    setProjects(updatedProjects);
  };

  const saveEditedTodo = () => {
    const updatedProjects = projects.map(project => {
      if (project.id === currentProjectId) {
        project.todos = project.todos.map(todo => {
          if (todo.id === editTodoId) {
            return { ...todo, description: editedTodoDescription };
          }
          return todo;
        });
      }
      return project;
    });
    setProjects(updatedProjects);
    setEditTodoId(null); // Exit edit mode after saving
    setEditedTodoDescription('');
  };

  if (!isLoggedIn) {
    return (
      <div className="loginContainer">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  if (currentProjectId) {
    // If a project is currently being viewed, show its details
    const currentProject = projects.find(project => project.id === currentProjectId);
    return (
      <div className="projectView">
        <input
          type="text"
          value={editedProjectTitle}
          onChange={(e) => setEditedProjectTitle(e.target.value)}
        />
        <button onClick={() => saveEditedTitle(currentProjectId)}>Save</button>
        
        <button onClick={() => setCurrentProjectId(null)}>Back to Projects</button>
        {/* Render project details (todos, etc.) here */}
        <div className="todos">
          <h3>Todos</h3>
          <input
            type="text"
            placeholder="🖊️ Add todo..."
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTodo(currentProjectId, e.target.value);
                setNewTodoDescription('');
              }
            }}
          />
          <ul>
            {currentProject.todos.map(todo => (
              <li key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodoStatus(todo.id)}
                />
                {editTodoId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editedTodoDescription}
                      onChange={(e) => setEditedTodoDescription(e.target.value)}
                    />
                    <button onClick={saveEditedTodo}>Save</button>
                  </>
                ) : (
                  <>
                    <span>{todo.description}</span>
                    <button onClick={() => {
                      setEditTodoId(todo.id);
                      setEditedTodoDescription(todo.description);
                    }}>Edit</button>
                    <button onClick={() => removeTodo(todo.id)}>Remove</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="mainHeading">
        <h1>ToDo List</h1>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="input">
        <input type="text" placeholder="🖊️ Add project title..." onKeyDown={(e) => {
          if (e.key === 'Enter') {
            createProject(e.target.value);
            e.target.value = '';
          }
        }} />
      </div>
      <div className="projectList">
        {projects.map(project => (
          <div className="projectItem" key={project.id}>
            <h2>{project.title}</h2>
            <button onClick={() => viewProject(project.id)}>View Project</button>
          </div>
        ))}
      </div>
      <button onClick={exportSummaryAsGist}>Export Summary as Gist</button>
    </div>
  );
}

export default App;