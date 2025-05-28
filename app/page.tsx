import './globals.css';
import { PrismaClient } from '@prisma/client';
import { useRouter } from 'next/navigation';

const prisma = new PrismaClient();

const Homepage = async() => {
  const documents = await prisma.document.findMany();
  
  return (
    <div className='items-center justify-center min-h-screen bg-plane p-10'>
      <div className='absolute inset-0 bg-white bg-opacity-80 z-0'/>
      <div className='relative z-10'>
        <div className='text-center mb-10 mt-10'>
          <img src="/Logo.png" alt="Boeing 737" className='w-60 mx-auto h-auto mb-4' />
          <div className='text-center text-3xl font-bold mb-10 text-blue-950'>Boeing-737</div>
        </div>
        <div className="flex items-center justify-center">
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10'>
            {documents.map((doc) => (
            <a className="card shadow-lg min-h-[150px] " key={doc.id} href={`/chapters/${doc.id}`}>
              <div className='bg-sky-800 text-blue-950 text-center bg-opacity-60 p-4 rounded-t-xl'>
                <h2 className="text-3xl font-bold">{doc.name}</h2>
              </div>
              <div className=' text-center p-4 rounded-b-xl'>
                <h2 className="text-gray-800">{doc.alias}</h2>
              </div>
            </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;