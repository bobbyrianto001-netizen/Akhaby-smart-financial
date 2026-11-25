/**
 * AKHAFIN - Default Initial Sample Data
 * Authentic Indonesian financial ecosystem (Bank, E-Wallet, Cash)
 */

function generateSampleData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Format helper YYYY-MM-DD
  const makeDate = (dayOffset = 0, hour = 10, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOffset);
    d.setHours(hour, min, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const ii = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${ii}`;
  };

  const accounts = [
    {
      id: 'acc_bca',
      name: 'Bank BCA Utama',
      provider: 'BCA',
      type: 'bank',
      accountNumber: '821-049-2811',
      initialBalance: 12500000,
      color: '#003399',
      notes: 'Rekening gaji & tabungan utama'
    },
    {
      id: 'acc_mandiri',
      name: 'Bank Mandiri',
      provider: 'Mandiri',
      type: 'bank',
      accountNumber: '137-00-19284-1',
      initialBalance: 6800000,
      color: '#003d79',
      notes: 'Rekening operasional & bisnis'
    },
    {
      id: 'acc_jago',
      name: 'Bank Jago',
      provider: 'Jago',
      type: 'bank',
      accountNumber: '1092-8374-1920',
      initialBalance: 3200000,
      color: '#7b2cbf',
      notes: 'Kantong belanja & langganan digital'
    },
    {
      id: 'acc_seabank',
      name: 'SeaBank Indonesia',
      provider: 'SeaBank',
      type: 'bank',
      accountNumber: '9018-2736-4512',
      initialBalance: 5000000,
      color: '#ff5722',
      notes: 'Dana darurat bunga harian'
    },
    {
      id: 'acc_gopay',
      name: 'GoPay',
      provider: 'GoPay',
      type: 'ewallet',
      accountNumber: '0812-8829-1029',
      initialBalance: 350000,
      color: '#00a5cf',
      notes: 'Transportasi & GoFood'
    },
    {
      id: 'acc_ovo',
      name: 'OVO Premier',
      provider: 'OVO',
      type: 'ewallet',
      accountNumber: '0812-8829-1029',
      initialBalance: 280000,
      color: '#4c2a86',
      notes: 'Grab & Merchant rekanan'
    },
    {
      id: 'acc_dana',
      name: 'DANA Wallet',
      provider: 'DANA',
      type: 'ewallet',
      accountNumber: '0812-8829-1029',
      initialBalance: 450000,
      color: '#118eea',
      notes: 'Pembayaran QRIS & Pulsa'
    },
    {
      id: 'acc_shopeepay',
      name: 'ShopeePay',
      provider: 'ShopeePay',
      type: 'ewallet',
      accountNumber: '0812-8829-1029',
      initialBalance: 240000,
      color: '#ee4d2d',
      notes: 'Belanja online marketplace'
    },
    {
      id: 'acc_cash',
      name: 'Uang Tunai (Dompet)',
      provider: 'Cash',
      type: 'cash',
      accountNumber: 'DOMPET-FISIK',
      initialBalance: 650000,
      color: '#10b981',
      notes: 'Uang cash pegangan harian & parkir'
    }
  ];

  const transactions = [
    {
      id: 'tx_01',
      date: makeDate(15, 9, 30),
      type: 'income',
      accountId: 'acc_bca',
      amount: 14500000,
      category: 'Gaji & Pendapatan',
      notes: 'Gaji Pokok & Tunjangan Bulanan',
      createdAt: makeDate(15, 9, 30)
    },
    {
      id: 'tx_02',
      date: makeDate(12, 14, 15),
      type: 'income',
      accountId: 'acc_mandiri',
      amount: 3200000,
      category: 'Freelance & Bisnis',
      notes: 'Pembayaran Project Web Development',
      createdAt: makeDate(12, 14, 15)
    },
    {
      id: 'tx_03',
      date: makeDate(11, 10, 0),
      type: 'transfer',
      accountId: 'acc_bca',
      toAccountId: 'acc_gopay',
      amount: 500000,
      adminFee: 1000,
      category: 'Top Up E-Wallet',
      notes: 'Top Up GoPay via BCA Mobile',
      createdAt: makeDate(11, 10, 0)
    },
    {
      id: 'tx_04',
      date: makeDate(10, 11, 30),
      type: 'transfer',
      accountId: 'acc_bca',
      toAccountId: 'acc_dana',
      amount: 400000,
      adminFee: 0,
      category: 'Top Up E-Wallet',
      notes: 'Top Up DANA Bebas Biaya Admin',
      createdAt: makeDate(10, 11, 30)
    },
    {
      id: 'tx_05',
      date: makeDate(9, 19, 45),
      type: 'expense',
      accountId: 'acc_mandiri',
      amount: 1250000,
      category: 'Belanja Kebutuhan',
      notes: 'Belanja Bulanan Supermarket & Bahan Dapur',
      createdAt: makeDate(9, 19, 45)
    },
    {
      id: 'tx_06',
      date: makeDate(8, 12, 20),
      type: 'expense',
      accountId: 'acc_gopay',
      amount: 68000,
      category: 'Makanan & Minuman',
      notes: 'Makan Siang Nasi Padang + Es Teh',
      createdAt: makeDate(8, 12, 20)
    },
    {
      id: 'tx_07',
      date: makeDate(7, 8, 15),
      type: 'expense',
      accountId: 'acc_gopay',
      amount: 35000,
      category: 'Transportasi',
      notes: 'Gojek ke Kantor',
      createdAt: makeDate(7, 8, 15)
    },
    {
      id: 'tx_08',
      date: makeDate(6, 16, 40),
      type: 'expense',
      accountId: 'acc_bca',
      amount: 750000,
      category: 'Tagihan & Utilitas',
      notes: 'Bayar Listrik PLN & Wi-Fi Internet Rumah',
      createdAt: makeDate(6, 16, 40)
    },
    {
      id: 'tx_09',
      date: makeDate(5, 20, 10),
      type: 'expense',
      accountId: 'acc_jago',
      amount: 186000,
      category: 'Hiburan & Streaming',
      notes: 'Langganan Netflix Premium & Spotify Family',
      createdAt: makeDate(5, 20, 10)
    },
    {
      id: 'tx_10',
      date: makeDate(4, 15, 30),
      type: 'expense',
      accountId: 'acc_shopeepay',
      amount: 210000,
      category: 'Belanja Online',
      notes: 'Beli Aksesoris Komputer & Keyboard Mat',
      createdAt: makeDate(4, 15, 30)
    },
    {
      id: 'tx_11',
      date: makeDate(3, 11, 0),
      type: 'expense',
      accountId: 'acc_dana',
      amount: 145000,
      category: 'Kesehatan & Medis',
      notes: 'Beli Vitamin C, D3 & Suplemen di Apotek',
      createdAt: makeDate(3, 11, 0)
    },
    {
      id: 'tx_12',
      date: makeDate(2, 13, 0),
      type: 'expense',
      accountId: 'acc_cash',
      amount: 50000,
      category: 'Makanan & Minuman',
      notes: 'Jajan Sore & Kopi Keliling',
      createdAt: makeDate(2, 13, 0)
    },
    {
      id: 'tx_13',
      date: makeDate(2, 18, 0),
      type: 'transfer',
      accountId: 'acc_bca',
      toAccountId: 'acc_cash',
      amount: 500000,
      adminFee: 0,
      category: 'Tarik Tunai',
      notes: 'Tarik Tunai di ATM BCA Dekat Rumah',
      createdAt: makeDate(2, 18, 0)
    },
    {
      id: 'tx_14',
      date: makeDate(1, 10, 30),
      type: 'income',
      accountId: 'acc_seabank',
      amount: 32500,
      category: 'Bunga & Investasi',
      notes: 'Bunga Tabungan Harian SeaBank',
      createdAt: makeDate(1, 10, 30)
    },
    {
      id: 'tx_15',
      date: makeDate(1, 12, 45),
      type: 'expense',
      accountId: 'acc_bca',
      amount: 350000,
      category: 'Zakat & Donasi',
      notes: 'Infaq & Santunan Rutin Jumat',
      createdAt: makeDate(1, 12, 45)
    },
    {
      id: 'tx_16',
      date: makeDate(0, 9, 15),
      type: 'expense',
      accountId: 'acc_gopay',
      amount: 45000,
      category: 'Makanan & Minuman',
      notes: 'Sarapan Lontong Sayur & Teh Hangat',
      createdAt: makeDate(0, 9, 15)
    }
  ];

  return {
    accounts,
    transactions,
    currency: 'IDR',
    lastUpdated: new Date().toISOString()
  };
}

window.generateSampleData = generateSampleData;
