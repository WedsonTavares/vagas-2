import Image from 'next/image';
import logo from '../assets/logo.png';
import Jobs from '../assets/jobs.png';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1'>
        <header className='max-w-6xl mx-auto px-4 sm:px-8 py-6'>
          <Image src={logo} alt='Logo' className='max-w-xs' />
        </header>
        <section className='max-w-6xl mx-auto px-4 sm:px-8 py-12 grid lg:grid-cols-2 items-center gap-12'>
          <div className='space-y-6'>
            <h1 className='text-4xl md:text-5xl lg:text-7xl font-bold leading-tight'>
              <span className='text-primary'>Gerenciamento</span>
              <br />
              de Vagas
            </h1>
            <p className='text-lg leading-relaxed max-w-lg text-gray-600'>
              Simplifique o processo de candidaturas com nossa plataforma
              intuitiva e eficiente.
            </p>
            <Button className='mt-6 px-8 py-3 text-lg' asChild>
              <Link href={'/dashboard'}>Comece Agora</Link>
            </Button>
          </div>
          <div className='hidden lg:flex justify-center'>
            <Image src={Jobs} alt='Jobs' className='max-w-full h-auto' />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
