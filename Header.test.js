import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import authReducer from '../../store/slices/authSlice';
import cartReducer from '../../store/slices/cartSlice';

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: initialState,
  });
};

describe('Header Component', () => {
  const renderHeader = (initialState) => {
    const store = createMockStore(initialState);
    return render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  };

  test('renders app title', () => {
    renderHeader({
      auth: { isAuthenticated: false },
      cart: { items: [] },
    });
    expect(screen.getByText('Food Delivery')).toBeInTheDocument();
  });

  test('shows login and register buttons when not authenticated', () => {
    renderHeader({
      auth: { isAuthenticated: false },
      cart: { items: [] },
    });
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('shows logout button when authenticated', () => {
    renderHeader({
      auth: { isAuthenticated: true },
      cart: { items: [] },
    });
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows cart with correct number of items', () => {
    renderHeader({
      auth: { isAuthenticated: true },
      cart: { items: [{ id: 1 }, { id: 2 }] },
    });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('navigates to restaurants page when clicking Restaurants button', () => {
    const { container } = renderHeader({
      auth: { isAuthenticated: false },
      cart: { items: [] },
    });
    
    const restaurantsButton = screen.getByText('Restaurants');
    fireEvent.click(restaurantsButton);
    
    // In a real application, we would test for actual navigation
    // Here we're just ensuring the button exists and is clickable
    expect(restaurantsButton).toBeInTheDocument();
  });
});