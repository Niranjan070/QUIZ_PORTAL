import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, role, viewportOptimized = false }) => {
    return (
        <div className="page-container">
            <Sidebar role={role} />
            <main className="main-content" style={{ padding: 0, height: viewportOptimized ? '100vh' : 'auto', overflow: viewportOptimized ? 'hidden' : 'visible' }}>
                <Header />
                <div style={{
                    padding: viewportOptimized ? 0 : '2rem',
                    height: viewportOptimized ? 'calc(100vh - 64px)' : 'auto', // Assuming header is around 64px
                    overflow: viewportOptimized ? 'hidden' : 'visible'
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
