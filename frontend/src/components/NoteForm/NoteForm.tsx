// src/Form.tsx
import React, { useContext, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import './NoteForm.css';
import { NotesContext } from '../../App';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormProps {
  isEdit?: boolean;
  initialTitle?: string;
  initialDescription?: string;
  _id?: string;
}

const NoteForm: React.FC<FormProps> = ({
  isEdit = false,
  initialTitle = '',
  initialDescription = '',
  _id = ''
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const backend_url: string = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
  const notesContext = useContext(NotesContext);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setErrors({});
  }, [ notesContext?.isFormOpen, initialTitle, initialDescription ]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        let response:any = [];
        if (isEdit) {
          const response = await axios.put(`${backend_url}/updateNote/${_id}`, { title, description });
          notesContext?.setNotes(response.data);
          toast.success('Note updated successfully');
        } else {
          response = await axios.post(`${backend_url}/createNote`, { title, description });
          notesContext?.setNotes(response.data);
          toast.success('Note created successfully');
        }
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
        setTitle('');
        setDescription('');
        notesContext?.handleFormClose();
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setErrors({});
    notesContext?.handleFormClose();
  };

  return (
    <Dialog open={notesContext?.isFormOpen ?? false} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="dialogHeader">
        {isEdit ? 'Edit Note' : 'Add Note'}
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading && <CircularProgress />} {/* Show loading spinner while API call is in progress */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
            {isEdit ? 'Update' : 'Submit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteForm;
