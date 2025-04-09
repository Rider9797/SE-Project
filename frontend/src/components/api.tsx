import axios from 'axios';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

export interface Note {
    _id: string;
    title: string;
    content: string;
    created_at: string;
}

export const authedApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

export const searchApi = axios.create({
    baseURL: 'http://127.0.0.1:5000/searches',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
    
});

// const fetchNotes = async () => {
//     try {
//         const response = await authedApi.get('/notes'); // Using the configured instance
//         setNotes(response.data);
//     } catch (error: unknown) {
//         // Type assertion to handle error as AxiosError
//         if (error instanceof AxiosError && error.response) {
//             if (error.response.status === 401) {
//                 // Token might have expired or is invalid, so redirect to login
//                 console.log('Session expired. Please log i4n again.');
//                 localStorage.removeItem('token');
//                 navigate('/')
//             } else if (error.response.status === 422) {
//                 // Handle 422 Unprocessable Entity error if needed
//                 console.log('Invalid data provided');
//             } else {
//                 // Handle other errors
//                 console.log(`Failed to fetch notes. Status Code: ${error.response.status}`);
//             }
//         } else {
//             console.log('An unknown error occurred');
//         }
//     } finally {
//         setLoading(false);
//     }
// };

export const fetchNotes = async (token: string | null) => {
    try {
        const response = await authedApi.get('/notes', {
      headers: { Authorization: `Bearer ${token}` }}); // Using the configured instance
        return response.data; // Return fetched notes
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
            if (error.response.status === 401) {
                console.log('Session expired. Please log in again.');
                localStorage.removeItem('token');
                // Consider redirecting to login here
            } else if (error.response.status === 422) {
                console.log('Invalid data provided');
            } else {
                console.log(`Failed to fetch notes. Status Code: ${error.response.status}`);
            }
        } else {
            console.log('An unknown error occurred');
        }
        return []; // Return an empty array in case of error
    }
};