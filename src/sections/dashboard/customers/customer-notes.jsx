import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import { CustomerNoteCard } from './customer-note-card';
import { CustomerNoteAdd } from './customer-note-add';
import { useMockedUser } from '../../../hooks/use-mocked-user';

export const CustomerNotes = (props) => {
  const { notes = [], onNoteCreate, onNoteDelete, ...other } = props;
  const user = useMockedUser();

  return (
    <Stack
      spacing={3}
      {...other}>
      <Typography variant="h6">
        Team Notes
      </Typography>
      <Stack spacing={3}>
        <CustomerNoteAdd onAdd={onNoteCreate} />
        {notes.map((note) => {
          const isDeletable = note.authorId === user.id;

          return (
            <CustomerNoteCard
              authorAvatar={note.authorAvatar}
              authorName={note.authorName}
              content={note.content}
              createdAt={note.createdAt}
              deletable={isDeletable}
              id={note.id}
              key={note.id}
              onDelete={onNoteDelete}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

CustomerNotes.propTypes = {
  notes: PropTypes.array,
  onNoteCreate: PropTypes.func,
  onNoteDelete: PropTypes.func
};
