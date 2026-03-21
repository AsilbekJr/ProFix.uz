import axios from 'axios';
import FormData from 'form-data';

(async () => {
  try {
    // 1. Avval login qilib token olamiz (yoki user yaratamiz)
    const { data: regRes } = await axios.post('http://localhost:5000/api/auth/register', {
      phone: '+998900000009',
      password: 'password123',
      name: 'Test Mijoz'
    }).catch(async (e) => {
      // already exists
      return await axios.post('http://localhost:5000/api/auth/login', {
        phone: '+998900000009',
        password: 'password123'
      });
    });

    const token = regRes.token;
    console.log('Got token:', token);
    
    // 2. Kategoriya olish
    const { data: catRes } = await axios.get('http://localhost:5000/api/categories');
    const categoryId = catRes.data[0].id;
    
    // 3. Buyurtma berish XATINI simulyatsiya
    const fd = new FormData();
    fd.append('categoryId', categoryId);
    fd.append('description', 'Test deraza buzulgan');
    fd.append('address', 'Test Viloyat, Test tuman');
    fd.append('secondaryPhone', '998900000000');
    
    const { data: orderRes } = await axios.post('http://localhost:5000/api/orders', fd, {
      headers: { ...fd.getHeaders(), Authorization: `Bearer ${token}` }
    });
    
    console.log('Order Result:', orderRes);
  } catch (err: any) {
    if (err.response) {
      console.error('API Error Response:', err.response.data);
    } else {
      console.error('Network/Other Error:', err.message);
    }
  }
})();
