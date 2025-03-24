import { Suspense } from 'react';
import ChatInterface from '@/components/ChatInterface';
import TestComponent from '@/components/TestComponent';

export default function Home() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <TestComponent />
      </Suspense>
      <ChatInterface />
    </>
  );
}
