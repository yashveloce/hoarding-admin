import React, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card'
import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import CircularProgress from '@material-ui/core/CircularProgress';
import { toast } from 'react-toastify';
import { Modal, Button } from "react-bootstrap";

const INSERT_CUSTOMER = gql`
mutation MyMutation($address: Int!, $contact_person: String = "", $email_id: String = "", $gst_no: String = "", $mobile_no: String = "", $name: String = "", $pan: String = "") {
    insert_customer_master_one(object: {address: $address, contact_person: $contact_person, email_id: $email_id, gst_no: $gst_no, mobile_no: $mobile_no, name: $name, pan: $pan}) {
      id
    }
  }
`
const READ_CUSTOMER = gql`
subscription MySubscription {
    customer_master {
        address
        contact_person
        email_id
        gst_no
        id
        location_master {
          taluka
        }
        mobile_no
        name
        pan
      }
  }  
`
const UPDATE_CUSTOMER = gql`
mutation MyMutation($address: Int!, $contact_person: String = "", $email_id: String = "", $gst_no: String = "", $mobile_no: String = "", $name: String = "", $pan: String = "", $id: Int!) {
    update_customer_master_by_pk(pk_columns: {id: $id}, _set: {address: $address, contact_person: $contact_person, email_id: $email_id, gst_no: $gst_no, mobile_no: $mobile_no, name: $name, pan: $pan}) {
      id
    }
  }
`

const DELETE_CUSTOMER = gql`
mutation MyMutation($id: Int!) {
    delete_customer_master_by_pk(id: $id) {
      address
      contact_person
      id
    }
  }
`
const READ_LOCATION = gql`
query MyQuery {
    location_master{
      city
      country
      id
      state
      taluka
      district
      cityByCity {
        id
        name
        state_id
      }
      countryByCountry {
        id
        name
        phonecode
        sortname
      }
      stateByState {
        country_id
        id
        name
      }
    }
  }  
`

export default function Customer_Master() {
    const [showModal, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [customer, setCustomer] = useState({
        name: '',
        address: '',
        contact_person: '',
        mobile_no: '',
        email_id: '',
        gst_no: '',
        pan: ''
    })
    const [modalCustomer, setModalCustomer] = useState({
        id: '',
        name: '',
        address: '',
        contact_person: '',
        mobile_no: '',
        email_id: '',
        gst_no: '',
        pan: ''
    })

    //Queries
    const [insert_customer] = useMutation(INSERT_CUSTOMER);
    const [update_customer] = useMutation(UPDATE_CUSTOMER);
    const [delete_customer] = useMutation(DELETE_CUSTOMER);
    const read_customer = useSubscription(READ_CUSTOMER);
    const read_location = useQuery(READ_LOCATION);
    //Loader
    if (read_customer.loading || read_location.loading) return <div style={{ width: "100%", marginTop: '25%', textAlign: 'center' }}><CircularProgress /></div>;

    const onInputChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    }
    const onFormSubmit = (e) => {
        e.preventDefault();
        insert_customer({ variables: { name: customer.name, address: customer.address, contact_person: customer.contact_person, mobile_no: customer.mobile_no, email_id: customer.email_id, gst_no: customer.gst_no, pan: customer.pan } })
        toast.configure();
        toast.success('Successfully Inserted')
    }
    const onEdit = (row) => {
        handleShow();
        setModalCustomer({
            id: row.id,
            name: row.name,
            address: row.address,
            contact_person: row.contact_person,
            mobile_no: row.mobile_no,
            email_id: row.email_id,
            gst_no: row.gst_no,
            pan: row.pan
        })
    }
    const onModalInputChange = (e) => {
        setModalCustomer({ ...modalCustomer, [e.target.name]: e.target.value })
    }
    const onModalFormSubmit = (e) => {
        e.preventDefault();
        update_customer({ variables: { id: modalCustomer.id, name: modalCustomer.name, mobile_no: modalCustomer.mobile_no, address: modalCustomer.address, email_id: modalCustomer.email_id, gst_no: modalCustomer.gst_no, pan: modalCustomer.pan, contact_person: modalCustomer.contact_person } })
        handleClose();
        toast.configure();
        toast.warning('Successfully Updated')
    }
    const onDelete = (id) => {
        delete_customer({ variables: { id: id } })
        toast.configure();
        toast.error('Successfully Deleted')
    }
    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 160,
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 160
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 160,
            valueGetter: (params) => {
                return params.row.location_master.taluka;
            }
        },
        {
            field: 'mobile_no',
            headerName: 'Mobile No',
            width: 160
        },
        {
            field: 'email_id',
            headerName: 'Email ID',
            width: 160
        },
        {
            field: 'contact_person',
            headerName: 'Contact Person',
            width: 160
        },
        {
            field: 'gst_no',
            headerName: 'GST No',
            width: 160
        },
        {
            field: 'pan',
            headerName: 'PAN',
            width: 160
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 200,
            renderCell: (params) => {
                return (
                    <div className="">
                        <button onClick={() => onEdit(params.row)} data-toggle="tooltip" title="Edit" type="button" className="btn btn-warning"  ><i className="bi bi-pencil-fill"></i></button>
                        <button onClick={() => onDelete(params.row.id)} data-toggle="tooltip" title="Delete" style={{ marginLeft: '20%' }} className="btn btn-danger" ><i className="bi bi-trash-fill"></i></button>
                    </div>
                );
            }
        },
    ];
    const rows = read_customer.data.customer_master;
    return (
        <div>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Edit Customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-md-6">
                        <form onSubmit={onModalFormSubmit} className="form-group">
                            <div className="field">
                                <label>ID</label>
                                <input defaultValue={modalCustomer.id} onChange={onModalInputChange} className="form-control" name="id" type="text" required/>
                            </div>
                            <div className="field">
                                <label>Name</label>
                                <input defaultValue={modalCustomer.name} onChange={onModalInputChange} className="form-control" name="name" type="text" required />
                            </div>
                            <div className="field">
                                <label>Address</label>
                                {/* <input defaultValue={modalCustomer.address} onChange={onModalInputChange} className="form-control" name="address" type="text" /> */}
                                <select defaultValue={modalCustomer.address} onChange={onModalInputChange} name="address" className="form-control" required>
                                    <option>--SELECT--</option>
                                    {read_location.data.location_master.map(location => (
                                        <option key={location.id} value={location.id}>{location.taluka}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Contact Person</label>
                                <input defaultValue={modalCustomer.contact_person} onChange={onModalInputChange} className="form-control" name="contact_person" type="text" required />
                            </div>
                            <div className="field">
                                <label>Mobile No</label>
                                <input defaultValue={modalCustomer.mobile_no} onChange={onModalInputChange} className="form-control" name="mobile_no" type="number" required />
                            </div>
                            <div className="field">
                                <label>Email Id</label>
                                <input defaultValue={modalCustomer.email_id} onChange={onModalInputChange} className="form-control" name="email_id" type="email" required />
                            </div>
                            <div className="field">
                                <label>GST No</label>
                                <input defaultValue={modalCustomer.gst_no} onChange={onModalInputChange} className="form-control" name="gst_no" type="text" required />
                            </div>
                            <div className="field">
                                <label>PAN</label>
                                <input defaultValue={modalCustomer.pan} onChange={onModalInputChange} className="form-control" name="pan" type="text" required />
                            </div><br />
                            <div className="field">
                                <button className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Card variant="outlined" className="form-card" style={{
                margin: "2%",
                padding: "2%",
                background: "#FFFFFF",
                boxShadow: "2px 2px 37px rgba(0, 0, 0, 0.25)",
                borderRadius: "10px"
            }}>
                <h4 className="text-center">CUSTOMER MASTER</h4>

                <form onSubmit={onFormSubmit} className="form-group" padding="2px">
                    <div className="row">
                        <div className="field col-md-6">
                            <label>Name</label>
                            <input placeholder="enter name" onChange={onInputChange} type="text" name="name" className="form-control" required />
                        </div>
                        <div className="field col-md-6">
                            <label>Address</label>
                            {/* <input onChange={onInputChange} type="text" name="address" className="form-control" /> */}
                            <select onChange={onInputChange} type="text" name="address" className="form-control" placeholder="enter address" required>
                                <option>--SELECT--</option>
                                {read_location.data.location_master.map(location => (
                                    <option key={location.id} value={location.id}>{location.taluka}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="field col-md-6">
                            <label>Mobile No</label>
                            <input onChange={onInputChange} placeholder="enter mobile no" type="number" name="mobile_no" className="form-control" required />
                        </div>
                        <div className="field col-md-6">
                            <label>Email Id</label>
                            <input onChange={onInputChange} placeholder="enter email id" type="email" name="email_id" className="form-control" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="field col-md-6">
                            <label>GST No</label>
                            <input onChange={onInputChange} placeholder="enter gst no" type="text" name="gst_no" className="form-control" required />
                        </div>
                        <div className="field col-md-6">
                            <label>PAN</label>
                            <input onChange={onInputChange} placeholder="enter pan" type="text" name="pan" className="form-control" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="field col-md-6">
                            <label>Contact Person</label>
                            <input onChange={onInputChange} placeholder="enter contact person" type="text" name="contact_person" className="form-control" required />
                        </div>
                    </div>
                    <div className="field" style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                        <button className="btn btn-primary" type='submit' style={{ marginRight: '50px' }}>Save</button>
                        <button className="btn btn-primary" type='reset'>Reset</button>
                        {/* <button className="btn btn-primary" type='Next' style={{ marginLeft: '5%' }}>Next</button> */}
                    </div>
                </form>
            </Card>
            <Card variant="outlined" className="form-card" style={{
                margin: "2%",
                padding: "2%",
                background: "#FFFFFF",
                boxShadow: "2px 2px 37px rgba(0, 0, 0, 0.25)",
                borderRadius: "10px"
            }}>

                <div style={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        checkboxSelection={false}
                        disableSelectiononChange
                    />
                </div>
            </Card>
        </div>
    )
}
