// useNotes.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { fetchNotes } from './api'; // Import the API function for fetching notes
import { Note } from './api'; // Adjust this import to your actual Note type

export const useNotes = (token: string | null) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate(); // Initialize navigate function

    useEffect(() => {
        if (!token) {
            console.log("hello")
            navigate('/'); // Redirect to login page if no token exists
            return;
        }

        const fetchNotesAPI = async (token: string | null) => {
            setLoading(true);
            
            const fetchedNotes = await fetchNotes(token);
            setNotes(fetchedNotes.data); // Optionally slice to get only the 4 most recent notes
            setLoading(false);
        };

        fetchNotesAPI(token);
    }, [token, navigate]); // Dependency on token and navigate to ensure rerun on token change

    return { notes, loading };
};
