import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard/staff');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 24px',
            borderRadius: '50px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            🏢 INTER-OFFICE AGENDA SYSTEM
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '30px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr'
        }}>

          {/* Left */}
          <div style={{
            background: 'linear-gradient(145deg, #4834d4 0%, #686de0 100%)',
            padding: '50px 40px',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              Streamline Your<br />
              <span style={{ color: '#ffd32a' }}>
                Office Communications
              </span>
            </h1>

            <p style={{
              fontSize: '18px',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              The complete solution for managing inter-office agendas,
              meetings, and department coordination.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>250+</div>
                <div>Active Offices</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>10k+</div>
                <div>Daily Users</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ padding: '50px 40px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '15px'
            }}>
              Welcome Back 👋
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#636e72',
              marginBottom: '40px'
            }}>
              Secure agenda management for modern offices
            </p>

            {/* Button (Fixed — no event handlers) */}
            <Link
              href="/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '18px',
                background: 'linear-gradient(145deg, #4834d4, #686de0)',
                color: 'white',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '15px',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                transition: 'opacity 0.2s ease'
              }}
            >
              Access Dashboard →
            </Link>

            <div style={{
              background: '#f5f6fa',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                Contact your administrator
              </p>
              <p style={{ fontSize: '14px', color: '#636e72' }}>
                to set up your account credentials
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: 'white',
          fontSize: '14px'
        }}>
          © 2026 IO Agenda System. All rights reserved.
        </div>

      </div>
    </div>
  );
}