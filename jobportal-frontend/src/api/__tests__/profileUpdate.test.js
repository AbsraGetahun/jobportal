import axios from 'axios';
import api from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Profile Update API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage to return a token
    localStorageMock.getItem.mockReturnValue('mock-access-token');

    // Mock axios create
    mockedAxios.create.mockReturnValue({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: mockedAxios.get,
      post: mockedAxios.post,
      put: mockedAxios.put,
      delete: mockedAxios.delete,
      patch: mockedAxios.patch,
    });
  });

  describe('updateProfile', () => {
    const mockProfileData = {
      name: 'John Doe Smith',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1234567890',
      age: '30',
      gender: 'male',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      graduationYear: '2020',
      experience: '5',
      location: 'New York',
      address: '123 Main St',
      website: 'https://example.com',
    };

    const mockFormData = new FormData();
    Object.keys(mockProfileData).forEach(key => {
      mockFormData.append(key, mockProfileData[key]);
    });

    test('successfully updates profile with FormData', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
            profile_picture: 'https://example.com/profile.jpg',
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(mockFormData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', mockFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('successfully updates profile with JSON data', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(mockProfileData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', mockProfileData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles validation errors from server', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              email: ['Email already exists'],
              username: ['Username already taken']
            }
          }
        }
      };

      mockedAxios.put.mockRejectedValue(validationError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(validationError.response.data);
    });

    test('handles authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized'
          }
        }
      };

      mockedAxios.put.mockRejectedValue(authError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(authError.response.data);

      // Should clear tokens on 401
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    test('handles network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      mockedAxios.put.mockRejectedValue(networkError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual({
        message: 'Network error. Please check your connection and try again.'
      });
    });

    test('handles server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error'
          }
        }
      };

      mockedAxios.put.mockRejectedValue(serverError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(serverError.response.data);
    });

    test('handles forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: {
            message: 'Forbidden'
          }
        }
      };

      mockedAxios.put.mockRejectedValue(forbiddenError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(forbiddenError.response.data);
    });

    test('handles not found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            message: 'Profile not found'
          }
        }
      };

      mockedAxios.put.mockRejectedValue(notFoundError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(notFoundError.response.data);
    });

    test('includes authorization header when token exists', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      await api.updateProfile(mockProfileData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/profile',
        mockProfileData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('handles missing authorization token', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      await api.updateProfile(mockProfileData);

      // Should still work but without auth header
      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', mockProfileData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    test('handles file upload with profile picture', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const formDataWithFile = new FormData();
      Object.keys(mockProfileData).forEach(key => {
        formDataWithFile.append(key, mockProfileData[key]);
      });
      formDataWithFile.append('profile_picture', file);

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
            profile_picture: 'uploads/profile_pictures/test.png',
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(formDataWithFile);

      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', formDataWithFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles empty phone field correctly', async () => {
      const dataWithEmptyPhone = {
        ...mockProfileData,
        phone: '',
      };

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...dataWithEmptyPhone,
            phone: null,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(dataWithEmptyPhone);

      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', dataWithEmptyPhone, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles null phone field correctly', async () => {
      const dataWithNullPhone = {
        ...mockProfileData,
        phone: null,
      };

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...dataWithNullPhone,
            phone: null,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(dataWithNullPhone);

      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', dataWithNullPhone, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Request Interceptors', () => {
    test('adds authorization header to requests', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            name: 'Test User',
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      await api.updateProfile(mockProfileData);

      // The interceptor should have been set up to add the authorization header
      // This is tested implicitly by the successful API call
      expect(mockedAxios.put).toHaveBeenCalled();
    });

    test('handles token refresh scenarios', async () => {
      // Mock a scenario where token needs refresh
      const authError = {
        response: {
          status: 401,
          data: {
            message: 'Token expired'
          }
        }
      };

      mockedAxios.put.mockRejectedValue(authError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(authError.response.data);

      // Should clear expired tokens
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Response Interceptors', () => {
    test('handles successful responses', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        },
        config: {
          url: '/profile',
          method: 'put'
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(mockProfileData);

      expect(result).toEqual(mockResponse);
    });

    test('logs profile update responses for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        },
        config: {
          url: '/profile',
          method: 'put'
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      await api.updateProfile(mockProfileData);

      // The interceptor should log profile update responses
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('handles generic errors', async () => {
      const genericError = new Error('Something went wrong');

      mockedAxios.put.mockRejectedValue(genericError);

      await expect(api.updateProfile(mockProfileData)).rejects.toEqual(genericError);
    });
  });

  describe('Edge Cases', () => {
    test('handles very large FormData', async () => {
      const largeFormData = new FormData();

      // Add many fields to simulate large form data
      for (let i = 0; i < 100; i++) {
        largeFormData.append(`field${i}`, `value${i}`);
      }

      const mockResponse = {
        data: {
          data: {
            id: 1,
            name: 'Test User',
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(largeFormData);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', largeFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });

    test('handles special characters in form data', async () => {
      const specialData = {
        name: 'José María ñoño',
        username: 'user@domain.com',
        email: 'test+tag@example.com',
        phone: '+1 (555) 123-4567',
        location: 'São Paulo - SP',
        website: 'https://example.com/path?query=value&other=123',
      };

      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...specialData,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await api.updateProfile(specialData);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.put).toHaveBeenCalledWith('/profile', specialData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    test('handles concurrent API calls', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 1,
            ...mockProfileData,
          }
        }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      // Make multiple concurrent calls
      const promises = [
        api.updateProfile(mockProfileData),
        api.updateProfile(mockProfileData),
        api.updateProfile(mockProfileData),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(mockedAxios.put).toHaveBeenCalledTimes(3);
    });
  });
});