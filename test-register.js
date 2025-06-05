import fetch from 'node-fetch';

const testRegister = async () => {
  try {
    const response = await fetch('https://money2025-thunder03.krkzfx.easypanel.host/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'João Teste',
        phone: '(31) 99876-5434',
        password: 'lombarde1'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
};

testRegister(); 