import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import images from '~/assets/images';
import Button from '~/components/Button';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);
function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
        setIsLoggedIn(false);
    };

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <Button to={'/'} className={cx('logo')}>
                    <img src={images.logo} alt="Traveloka" />
                </Button>
                <ul className={cx('nav')}>
                    <li>
                        <img className={cx('percent')} src={images.percent} alt="khuyen_mai" />
                        <a href="/">Khuyến Mãi</a>
                    </li>
                    <li>
                        <a href="/">Hỗ Trợ</a>
                    </li>
                    <li>
                        <a href="/">Hợp Tác Với Chúng Tôi</a>
                    </li>
                    {isLoggedIn ? (
                        <>
                            <Button outline to="/infoAccount" leftIcon={<img src={images.user} alt="User" />}>
                                Tài Khoản
                            </Button>
                            <Button primary onClick={handleLogout}>
                                Đăng Xuất
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                 className={cx('loginBtn')}
                                 outline
                                 to="/login"
                                 leftIcon={<img src={images.user} alt="User" />}
                             >
                                Đăng Nhập
                            </Button>

                            <Button primary to="/register">
                                Đăng Ký
                            </Button>
                        </>
                    )}
                </ul>
            </div>
            <div className={cx('title-page')}>
                <a href="/">VÉ MÁY BAY</a>
            </div>
        </header>
    );
}

export default Header;
