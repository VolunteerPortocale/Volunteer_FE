import express from 'express';

const app = express();
const port = 8080;

app.use(express.json());

// Support REST endpoints
app.get('/api/users/:userId', (req, res) => {
  res.json({
    id: req.params.userId,
    name: 'Test Volunteer',
    email: 'volunteer@example.com',
  });
});

app.get('/api/v1/users', (_req, res) => {
  res.json([
    {
      id: '1',
      firstName: 'Ion',
      lastName: 'Popescu',
      email: 'ion@example.com',
      phoneNumber: '+37360000000',
      role: 'VOLUNTEER',
      status: 'ACTIVE',
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Ionescu',
      email: 'maria@example.com',
      phoneNumber: '+37361111111',
      role: 'NGO',
      status: 'ACTIVE',
    },
  ]);
});

// Support GraphQL endpoint
app.post('/api/graphql', (req, res) => {
  const query = req.body?.query ?? '';
  const userId = req.body?.variables?.id ?? 'unknown';

  if (query.includes('getAllUsers')) {
    return res.json({
      data: {
        getAllUsers: [
          {
            id: '1',
            firstName: 'Ion',
            lastName: 'Popescu',
            email: 'ion@example.com',
            phoneNumber: '+37360000000',
            role: 'VOLUNTEER',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });
  }

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
