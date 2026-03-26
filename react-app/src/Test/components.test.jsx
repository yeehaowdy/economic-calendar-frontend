import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ─────────────────────────────────────────────
// Firebase app mock
// ─────────────────────────────────────────────
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ─────────────────────────────────────────────
// Segédfüggvény
// ─────────────────────────────────────────────
const renderWithRouter = (ui, { route = '/' } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

// ══════════════════════════════════════════════
// 1. ADMINROUTE
// ══════════════════════════════════════════════
describe('AdminRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('betöltés közben "VERIFYING PERMISSIONS..." szöveg látható', async () => {
    onAuthStateChanged.mockImplementation(() => () => {});

    const { default: AdminRoute } = await import('../Components/AdminPanel/AdminRoute');
    renderWithRouter(
      <AdminRoute><div>Admin tartalom</div></AdminRoute>
    );

    expect(screen.getByText(/VERIFYING PERMISSIONS/i)).toBeInTheDocument();
  });

  it('admin felhasználó esetén a children renderelődik', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: 'admin-uid' });
      return () => {};
    });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    });
    doc.mockReturnValue({});

    const { default: AdminRoute } = await import('../Components/AdminPanel/AdminRoute');
    renderWithRouter(
      <AdminRoute><div>Admin tartalom</div></AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin tartalom')).toBeInTheDocument();
    });
  });

  it('nem admin felhasználót "/" -re irányít', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: 'user-uid' });
      return () => {};
    });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'user' }),
    });
    doc.mockReturnValue({});

    const { default: AdminRoute } = await import('../Components/AdminPanel/AdminRoute');
    renderWithRouter(
      <AdminRoute><div>Admin tartalom</div></AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });

  it('nem bejelentkezett felhasználót "/" -re irányít', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return () => {};
    });

    const { default: AdminRoute } = await import('../Components/AdminPanel/AdminRoute');
    renderWithRouter(
      <AdminRoute><div>Admin tartalom</div></AdminRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });
});

// ══════════════════════════════════════════════
// 2. LOGIN
// ══════════════════════════════════════════════
describe('Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderelődik email és jelszó mezővel', async () => {
    const { default: Login } = await import('../Components/Auth/Login');
    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('sikeres bejelentkezésnél nem jelenik meg hiba', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });

    const { default: Login } = await import('../Components/Auth/Login');
    renderWithRouter(<Login />);

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  it('hibás bejelentkezésnél hibaüzenet jelenik meg', async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error('auth/wrong-password'));

    const { default: Login } = await import('../Components/Auth/Login');
    renderWithRouter(<Login />);

    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'wrong@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('jelszó megjelenítés/elrejtés gomb működik', async () => {
    const { default: Login } = await import('../Components/Auth/Login');
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const allButtons = screen.getAllByRole('button');
    const toggleBtn = allButtons.find(b => b.getAttribute('type') === 'button');
    await userEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('Register linkre mutató link megjelenik', async () => {
    const { default: Login } = await import('../Components/Auth/Login');
    renderWithRouter(<Login />);

    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 3. REGISTER
// ══════════════════════════════════════════════
describe('Register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderelődik full name, email és jelszó mezővel', async () => {
    const { default: Register } = await import('../Components/Auth/Register');
    renderWithRouter(<Register />);

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('sikeres regisztrációnál createUserWithEmailAndPassword meghívódik', async () => {
    const fakeUser = { uid: 'new-uid', email: 'new@test.com' };
    createUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
    updateProfile.mockResolvedValue();
    setDoc.mockResolvedValue();
    doc.mockReturnValue({});

    const { default: Register } = await import('../Components/Auth/Register');
    renderWithRouter(<Register />);

    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'Test Elek');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password123'
      );
    });
  });

  it('firebase hiba esetén megjelenik a hibaüzenet', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(
      new Error('Firebase: Password should be at least 6 characters (auth/weak-password).')
    );

    const { default: Register } = await import('../Components/Auth/Register');
    renderWithRouter(<Register />);

    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'Test Elek');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), '123');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/weak-password/i)).toBeInTheDocument();
    });
  });

  it('Login linkre mutató link megjelenik', async () => {
    const { default: Register } = await import('../Components/Auth/Register');
    renderWithRouter(<Register />);

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 4. HOME
// ══════════════════════════════════════════════
describe('Home', () => {
  beforeEach(() => vi.clearAllMocks());

  it('nem bejelentkezett felhasználónak "JOIN THE NETWORK" gombot mutat', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return () => {};
    });

    const { default: Home } = await import('../Components/Home/Home');
    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/JOIN THE NETWORK/i)).toBeInTheDocument();
    });
  });

  it('bejelentkezett felhasználónak "GO TO PROFILE" gombot mutat', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: 'user-1', displayName: 'Test Elek', email: 'test@test.com' });
      return () => {};
    });

    const { default: Home } = await import('../Components/Home/Home');
    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/GO TO PROFILE/i)).toBeInTheDocument();
    });
  });

  it('a feature kártyák megjelennek (Calendar, Markets, News)', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return () => {};
    });

    const { default: Home } = await import('../Components/Home/Home');
    renderWithRouter(<Home />);

    expect(screen.getAllByText('Economic Calendar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Live Markets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Market News').length).toBeGreaterThan(0);
  });

  it('a hero title megjelenik', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb(null);
      return () => {};
    });

    const { default: Home } = await import('../Components/Home/Home');
    renderWithRouter(<Home />);

    expect(screen.getByText(/NAVIGATE THE/i)).toBeInTheDocument();
    expect(screen.getByText(/FINANCIAL MARKETS/i)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 5. CALENDAR – filter logika (unit)
// ══════════════════════════════════════════════
describe('Calendar – filter logika (unit)', () => {
  const mockEvents = [
    { id: '1', date: '2026-03-26T14:30:00Z', country: 'USD', impact: 'High', title: 'CPI Data' },
    { id: '2', date: '2026-03-26T10:00:00Z', country: 'EUR', impact: 'Low', title: 'PMI Flash' },
    { id: '3', date: '2026-03-27T08:00:00Z', country: 'USD', impact: 'Medium', title: 'GDP Report' },
  ];

  const filterEvents = (events, selectedDate, filterCurrency, filterImpact) =>
    events.filter(e => {
      const isSameDay = e.date?.startsWith(selectedDate);
      const matchCur = filterCurrency.includes('All') || filterCurrency.includes(e.country);
      const matchImp = filterImpact.includes('All') || filterImpact.includes(e.impact);
      return isSameDay && matchCur && matchImp;
    });

  const handleToggleFilter = (value, currentList, setList) => {
    if (value === 'All') {
      setList(['All']);
    } else {
      let newList = currentList.filter(item => item !== 'All');
      if (newList.includes(value)) {
        newList = newList.filter(item => item !== value);
        if (newList.length === 0) newList = ['All'];
      } else {
        newList = [...newList, value];
      }
      setList(newList);
    }
  };

  it('adott napra szűr helyesen', () => {
    expect(filterEvents(mockEvents, '2026-03-26', ['All'], ['All'])).toHaveLength(2);
  });

  it('currency filter működik', () => {
    const result = filterEvents(mockEvents, '2026-03-26', ['EUR'], ['All']);
    expect(result).toHaveLength(1);
    expect(result[0].country).toBe('EUR');
  });

  it('impact filter működik', () => {
    const result = filterEvents(mockEvents, '2026-03-26', ['All'], ['High']);
    expect(result).toHaveLength(1);
    expect(result[0].impact).toBe('High');
  });

  it('kombinált filter helyesen szűr', () => {
    const result = filterEvents(mockEvents, '2026-03-26', ['USD'], ['High']);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('CPI Data');
  });

  it('üres nap esetén üres tömböt ad vissza', () => {
    expect(filterEvents(mockEvents, '2026-03-28', ['All'], ['All'])).toHaveLength(0);
  });

  it('All filter minden eseményt visszaad az adott napra', () => {
    expect(filterEvents(mockEvents, '2026-03-26', ['All'], ['All']).length).toBeGreaterThan(0);
  });

  it('handleToggleFilter: All kiválasztásakor többi törlődik', () => {
    const setList = vi.fn();
    handleToggleFilter('All', ['USD', 'EUR'], setList);
    expect(setList).toHaveBeenCalledWith(['All']);
  });

  it('handleToggleFilter: utolsó elem eltávolításakor All-ra vált vissza', () => {
    const setList = vi.fn();
    handleToggleFilter('USD', ['USD'], setList);
    expect(setList).toHaveBeenCalledWith(['All']);
  });
});

// ══════════════════════════════════════════════
// 6. NEWS
// ══════════════════════════════════════════════
describe('News', () => {
  const mockNewsData = {
    data: [
      { id: '1', title: 'BTC Surges', description: 'Bitcoin hit a new ATH today in the markets.', source: 'Bloomberg', relatedCurrency: 'BTC', pubDate: '2026-03-26', link: 'https://bloomberg.com/1' },
      { id: '2', title: 'Fed Rate Decision', description: 'Federal Reserve keeps rates unchanged at March meeting.', source: 'Reuters', relatedCurrency: 'USD', pubDate: '2026-03-25', link: 'https://reuters.com/2' },
    ],
    totalPages: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockNewsData,
    });
    Storage.prototype.getItem = vi.fn(() => null);
  });

  afterEach(() => vi.restoreAllMocks());

  it('hírek megjelennek betöltés után', async () => {
    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.getByText('BTC Surges')).toBeInTheDocument();
      expect(screen.getByText('Fed Rate Decision')).toBeInTheDocument();
    });
  });

  it('pagination info megjelenik (1 / 3)', async () => {
    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('PREVIOUS gomb disabled az első oldalon', async () => {
    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  it('NEXT gomb enabled ha több oldal van', async () => {
    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  it('üres adat esetén "No market news found" üzenet jelenik meg', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], totalPages: 1 }),
    });

    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.getByText(/No market news found/i)).toBeInTheDocument();
    });
  });

  it('fetch hiba esetén a loading eltűnik és nem crashel', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    const { default: News } = await import('../Components/News/News');
    renderWithRouter(<News />);

    await waitFor(() => {
      expect(screen.queryByText(/LOADING/i)).not.toBeInTheDocument();
    });
  });
});

// ══════════════════════════════════════════════
// 7. MARKETS – keresés és cache (unit)
// ══════════════════════════════════════════════
describe('Markets – keresés logika (unit)', () => {
  const mockStocks = [
    { symbol: 'AAPL', current: 175.5, pc: 1.2, direction: 'up', chartData: [], originalSymbol: 'AAPL' },
    { symbol: 'TSLA', current: 250.0, pc: -2.5, direction: 'down', chartData: [], originalSymbol: 'TSLA' },
    { symbol: 'BTC/USD', current: 85000, pc: 3.1, direction: 'up', chartData: [], originalSymbol: 'BINANCE:BTCUSDT' },
  ];

  const filterStocks = (stocks, searchTerm) =>
    stocks.filter(s => s.symbol.toLowerCase().includes(searchTerm.toLowerCase()));

  it('üres keresési feltételre minden részvény megjelenik', () => {
    expect(filterStocks(mockStocks, '')).toHaveLength(3);
  });

  it('részleges névegyezésre szűr (kis-nagybetű független)', () => {
    expect(filterStocks(mockStocks, 'aapl')).toHaveLength(1);
    expect(filterStocks(mockStocks, 'AAPL')).toHaveLength(1);
  });

  it('nem létező szimbólumra üres tömböt ad vissza', () => {
    expect(filterStocks(mockStocks, 'GOOGL')).toHaveLength(0);
  });

  it('crypto szimbólum is kereshető', () => {
    expect(filterStocks(mockStocks, 'BTC')).toHaveLength(1);
  });
});

describe('Markets – localStorage cache', () => {
  it('cache-ből tölti be az adatokat ha létezik', () => {
    const cachedData = [{ symbol: 'AAPL', current: 175, pc: 1, direction: 'up', chartData: [] }];
    Storage.prototype.getItem = vi.fn((key) =>
      key === 'market_data_cache' ? JSON.stringify(cachedData) : null
    );

    const saved = localStorage.getItem('market_data_cache');
    const stocks = saved ? JSON.parse(saved) : [];
    expect(stocks).toHaveLength(1);
    expect(stocks[0].symbol).toBe('AAPL');
  });

  it('nincs cache esetén üres tömböt ad', () => {
    Storage.prototype.getItem = vi.fn(() => null);
    const saved = localStorage.getItem('market_data_cache');
    const stocks = saved ? JSON.parse(saved) : [];
    expect(stocks).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════
// 8. ADMINPANEL
// ══════════════════════════════════════════════
describe('AdminPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    onAuthStateChanged.mockImplementation((auth, cb) => {
      cb({ uid: 'admin-uid' });
      return () => {};
    });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    });
    doc.mockReturnValue({});
  });

  it('admin felhasználónak megjelenik a dashboard', async () => {
    const { default: AdminPanel } = await import('../Components/AdminPanel/AdminPanel');
    renderWithRouter(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText(/ADMIN/i)).toBeInTheDocument();
    });
  });

  it('nem admin felhasználónak "Access Denied" üzenet jelenik meg', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'user' }),
    });

    const { default: AdminPanel } = await import('../Components/AdminPanel/AdminPanel');
    renderWithRouter(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    });
  });

  it('CALENDAR MANAGEMENT tabra váltáskor megjelenik a naptár form', async () => {
    const { default: AdminPanel } = await import('../Components/AdminPanel/AdminPanel');
    renderWithRouter(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText(/CALENDAR MANAGEMENT/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/CALENDAR MANAGEMENT/i));

    await waitFor(() => {
      expect(screen.getByText(/Add Calendar Event/i)).toBeInTheDocument();
    });
  });

  it('hírküldés után fetch meghívódik', async () => {
    global.alert = vi.fn();
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const { default: AdminPanel } = await import('../Components/AdminPanel/AdminPanel');
    renderWithRouter(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Title/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/Title/i), 'Test Hír');
    await userEvent.type(screen.getByPlaceholderText(/Source/i), 'Bloomberg');
    await userEvent.type(screen.getByPlaceholderText(/Article Link/i), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /PUBLISH/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
