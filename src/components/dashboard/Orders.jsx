'use client'
import * as React from 'react';
// import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useStateContext } from '../../../context/stateContext';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
// import Title from './Title';


function preventDefault(event) {
  event.preventDefault();
}

export default function Orders() {
  const {gmail,fetchAllGmail,deleteDocument}=useStateContext()
  const [isLoading, setIsLoading] = React.useState(true); 

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllGmail();  
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  
  if(isLoading){
    return <h1 style={{marginTop:'200px', marginBottom:'100px'}}>Loading...</h1>
  }
  return (
    <React.Fragment>
      {/* <Title>Registered G-mails</Title> */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><b>Sl No</b></TableCell>
            <TableCell><b>G-mail</b></TableCell>
            <TableCell><b>Action</b></TableCell>
            {/* <TableCell>Payment Method</TableCell>
            <TableCell align="right">Sale Amount</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {gmail&&gmail.map((row,index) => (
            <TableRow key={index}>
              <TableCell>{index+1}</TableCell>
              <TableCell>{row.gmail}</TableCell>
              <TableCell>
                <Button variant="outlined"
                  color='error'
                  startIcon={<DeleteIcon />}
                  style={{ marginTop: '0px' }}
                  onClick={async () => {
                    await deleteDocument('gmail', row.id)
                  }}
                >
                  Delete
                </Button>
              </TableCell>
              {/* <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{`$${row.amount}`}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link> */}
    </React.Fragment>
  );
}