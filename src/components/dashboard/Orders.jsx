'use client'
import * as React from 'react';
import { DashboardSkeleton } from '../Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useStateContext } from '../../../context/stateContext';

export default function Orders() {
  const { gmail, fetchAllGmail, deleteDocument } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllGmail();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!gmail || gmail.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No registered accounts yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: 60 }}>Sl No</TableCell>
          <TableCell>Email Address</TableCell>
          <TableCell sx={{ width: 80 }} align="center">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {gmail.map((row, index) => (
          <TableRow key={row.id || index}>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{row.gmail}</Typography>
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Remove access">
                <IconButton
                  size="small"
                  onClick={async () => {
                    await deleteDocument('gmail', row.id);
                  }}
                  sx={{
                    color: '#B71C1C',
                    '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
