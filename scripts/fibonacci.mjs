console.log('Command line arguments:', process.argv);

const AUTH_API_URL = process.argv[2] || 'http://localhost:3000/graphql';

const LOGIN_MUTATION = `
    mutation Login($loginData: LoginDto!) {
        login(loginData: $loginData) {
            id
            email
        }
    }
`;

const JOBS_API_URL = process.argv[3] || 'http://localhost:3001/graphql';

const EXECUTE_JOB_MUTATION = `
    mutation ExecuteJob($executeJobData: ExecuteJobDto!) {
        executeJob(executeJobData: $executeJobData) {
            name
        }
    }
`;

async function login(email, password) {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: {
        loginData: {
          email,
          password,
        },
      },
    }),
  });

  const data = await response.json();
  const cookies = response.headers.get('Set-Cookie');
  return {
    data,
    cookies,
  };
}

async function executeJob(jobData, cookies) {
  const response = await fetch(JOBS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({
      query: EXECUTE_JOB_MUTATION,
      variables: {
        executeJobData: jobData,
      },
    }),
  });

  const data = await response.json();
  return data;
}

(async () => {
  const { data, cookies } = await login('jordan2@jordan.com', 'titkos@3WEw');
  console.log(data);
  console.log(cookies);

  if (data?.data?.login?.id) {
    const n = parseInt(process.argv[4], 10) || 1000;
    console.log(`Generating ${n} Fibonacci numbers`);
    const jobData = {
      jobName: 'fibonacci',
      data: Array.from({ length: n }, (_, i) => ({
        iterations: Math.floor(Math.random() * 5000) + 1,
      })),
    };
    const data = await executeJob(jobData, cookies);
    console.log(data);
  } else {
    console.error('Login failed');
  }
})();
