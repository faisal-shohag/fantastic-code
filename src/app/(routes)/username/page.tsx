"use client"

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


const UsernameSelectionPage = () => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState('');

  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.username) {
      router.push('/');
    }
  }, [session, router]);

  const checkUsernameAvailability = async () => {
    if (!username) return;

    setCheckingAvailability(true);
    setError('');
    setIsAvailable(false);

    try {
      const response = await fetch(`/api/username/check?username=${username}`);
      const data = await response.json();

      if (data.available) {
        setIsAvailable(true);
      } else {
        setError('Username is already taken');
      }
    } catch (err) {
        console.log(err)
      setError('Error checking username availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleUsernameSubmit = async () => {
    if (!isAvailable) {
      setError('Please choose an available username');
      return;
    }

    try {
      const response = await fetch('/api/username/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the session with the new username
        await update({ 
          username 
        });
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to set username');
      }
    } catch (err) {
        console.log(err)
      setError('Error setting username');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className=" dark:bg-zinc-900 p-8 rounded-lg shadow-2xl w-96">
        <h2 className="text-2xl font-bold mb-4">Choose Your Username</h2>
        <div className="mb-4">
          <Input 
            placeholder="Enter username" 
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setIsAvailable(false);
              setError('');
            }}
            className="w-full"
          />
        </div>
        <div className="mb-4 flex items-center">
          <Button 
            onClick={checkUsernameAvailability} 
            disabled={!username || checkingAvailability}
            variant="outline"
            className="mr-2"
          >
            {checkingAvailability ? 'Checking...' : 'Check Availability'}
          </Button>
          {isAvailable && (
            <span className="text-green-500">✓ Available</span>
          )}
        </div>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        <Button 
          onClick={handleUsernameSubmit} 
          disabled={!isAvailable}
          className="w-full"
        >
          Set Username
        </Button>
      </div>
    </div>
  );
};

export default UsernameSelectionPage;