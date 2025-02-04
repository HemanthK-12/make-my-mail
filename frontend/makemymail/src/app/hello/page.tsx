"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Hello()
{
    const [message, setMessage]=useState('');
    useEffect(
        ()=>
        {
            axios.get('http://localhost:8080/api/hello')
            .then(
                response=>
                {
                    setMessage(response.data);
                }
            ).catch(error=>{setMessage('Error while fetching data')});
        },[]
    );
    return (
        <div>
            <h2>{message}</h2>
        </div>
    );
}