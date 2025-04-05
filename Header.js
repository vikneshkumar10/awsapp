import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  makeStyles,
} from '@material-ui/core';
import {
  ShoppingCart as CartIcon,
  Person as ProfileIcon,
  Restaurant as RestaurantIcon,
} from '@material-ui/icons';
import { logout } from '../store/slices/authSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    cursor: 'pointer',
  },
  button: {
    marginLeft: theme.spacing(2),
  },
}));

function Header() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const handleLogout = async () => {
    await dispatch(logout());
    history.push('/');
  };

  const navigateTo = (path) => {
    history.push(path);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            className={classes.title}
            onClick={() => navigateTo('/')}
          >
            Food Delivery
          </Typography>

          <Button
            color="inherit"
            startIcon={<RestaurantIcon />}
            className={classes.button}
            onClick={() => navigateTo('/restaurants')}
          >
            Restaurants
          </Button>

          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                className={classes.button}
                onClick={() => navigateTo('/cart')}
              >
                <Badge badgeContent={items.length} color="secondary">
                  <CartIcon />
                </Badge>
              </IconButton>

              <IconButton
                color="inherit"
                className={classes.button}
                onClick={() => navigateTo('/profile')}
              >
                <ProfileIcon />
              </IconButton>

              <Button
                color="inherit"
                className={classes.button}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                className={classes.button}
                onClick={() => navigateTo('/login')}
              >
                Login
              </Button>
              <Button
                color="inherit"
                className={classes.button}
                onClick={() => navigateTo('/register')}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;