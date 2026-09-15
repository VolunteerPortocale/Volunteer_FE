import express from 'express';

const app = express();
const port = 8080;

app.use(express.json());

app.get('/api/users/:userId', (req, res) => {
  res.json({
    id: req.params.userId,
    name: 'Test Volunteer',
    email: 'volunteer@example.com',
  });
});

app.post('/api/graphql', (req, res) => {
  const userId = req.body?.variables?.id ?? 'unknown';

  res.json({
    data: {
      user: {
        id: userId,
        permissions: [
          { role: 'volunteer', resource: 'projects' },
          { role: 'viewer', resource: 'profile' },
        ],
      },
    },
  });
});

app.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`);
});
