import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserService from '../../services/user';
import Title from '../../components/Title';
import { TextField, Button, Box, Grid } from '../../mui/material';
import CustomSnackbar, { Severity } from 'src/shared/components/snackbar';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // snackbar
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSnackbar = (description) => {
    setIsOpen(true);
    setDescription(description);
  };

  const handleLogin = async () => {
    try {
      const response = await useUserService.login(username, password);
      if (response.token) {
        // saves token in local storage
        navigate('/app');
        navigate(0);
      } else {
        console.error('Login failed:', response.status, response.statusText);
        handleSnackbar(response.statusText);
      }
    } catch (error) {
      console.error('Login failed:', error);
      handleSnackbar(error);
    }
  };

  return (
    <>
      <Box
        sx={{
          '& > :not(style)': { m: 1 },
        }}
        noValidate
        autoComplete="off"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Title>EPCIS 2.0 Blockchain Admin Panel</Title>
          <Grid
            container
            spacing={2}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '200px', width: '75ch' }}
          >
            <Grid item sx={{ width: '100%' }}>
              <TextField
                id="username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={handleUsernameChange}
                size="small"
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
              <TextField
                id="password"
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                size="small"
                sx={{ width: '100%' }}
              />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{ width: '100%' }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <CustomSnackbar
        open={isOpen}
        severity={Severity.ERROR}
        action={'LOGIN'}
        description={description}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default Login;
