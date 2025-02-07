import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import styled from 'styled-components';
import { FaBook, FaUser, FaStar, FaChartBar, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import PropTypes from 'prop-types';
import ManageBooks from './ManageBooks';
import ManageAuthors from './ManageAuthors';
//  import.meta.env.VITE_API_URL || "http://localhost:5000";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale
);

const BREAKPOINTS = {
    mobile: '320px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1200px'
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalBooks: 0,
        totalAuthors: 0,
        activeUsers: 0,
        totalReviews: 0,
        popularBooks: [],
        popularAuthors: [],
        booksByGenre: {
            labels: [],
            data: []
        },
        monthlyReviews: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [0, 0, 0, 0, 0, 0]
        },
        ratingDistribution: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            data: [0, 0, 0, 0, 0]
        }
    });
    const [currentPageBooks, setCurrentPageBooks] = useState(1);
    const [currentPageAuthors, setCurrentPageAuthors] = useState(1);
    const itemsPerPage = 5;
    // console.log(API_URL);
    useEffect(() => {
        if (activeTab === 'tables') {
            fetchBooksAndAuthors();
        } else if (activeTab === 'overview') {
            fetchDashboardStats();
        }
    }, [activeTab]);

    useEffect(() => {
        console.log(books); // This will read the books state
    }, [books]);

    useEffect(() => {
        console.log(authors); // Log authors to avoid unused variable warning
    }, [authors]);

    const fetchBooksAndAuthors = async () => {
        setLoading(true);
        try {
            const [booksResponse, authorsResponse] = await Promise.all([
                fetch('http://localhost:5000/books'),
                fetch('http://localhost:5000/authors')
            ]);

            const booksData = await booksResponse.json();
            const authorsData = await authorsResponse.json();

            const books = booksData.books;
            const authors = authorsData.authors;

            // Calculate release date distribution
            const releaseDateCounts = {};
            books.forEach(book => {
                const year = book.releaseDate;
                releaseDateCounts[year] = (releaseDateCounts[year] || 0) + 1;
            });

            // Sort years chronologically
            const sortedYears = Object.keys(releaseDateCounts).sort();

            // Calculate nationality distribution for authors
            const nationalityCounts = {};
            authors.forEach(author => {
                const nationality = author.nationality;
                nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
            });

            // Assuming popular books and authors are the first 5 from the fetched data
            const popularBooks = books.slice(0, 5);
            const popularAuthors = authors.slice(0, 5);

            setDashboardStats({
                totalBooks: booksData.totalItems,
                totalAuthors: authorsData.totalItems,
                activeUsers: authors.length, // Using authors count as active users
                totalReviews: books.length, // Using books count as reviews
                popularBooks: popularBooks,
                popularAuthors: popularAuthors,
                booksByGenre: {
                    labels: sortedYears,
                    data: sortedYears.map(year => releaseDateCounts[year])
                },
                monthlyReviews: {
                    labels: Object.keys(nationalityCounts),
                    data: Object.values(nationalityCounts)
                },
                ratingDistribution: {
                    labels: ['Classic', 'Modern', 'Contemporary'],
                    data: [
                        books.filter(book => parseInt(book.releaseDate) < 1900).length,
                        books.filter(book => parseInt(book.releaseDate) >= 1900 && parseInt(book.releaseDate) < 2000).length,
                        books.filter(book => parseInt(book.releaseDate) >= 2000).length
                    ]
                }
            });

            // Update books state for tables
            setBooks(books.map(book => ({
                id: book._id,
                title: book.title,
                author: book.author.name,
                releaseDate: book.releaseDate,
                content: book.content,
                image: book.image
            })));

            // Update authors state
            setAuthors(authors.map(author => ({
                id: author._id,
                name: author.name,
                birthYear: author.birthYear,
                deathYear: author.deathYear,
                nationality: author.nationality
            })));

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const [booksResponse, authorsResponse] = await Promise.all([
                fetch('http://localhost:5000/books'),
                fetch('http://localhost:5000/authors')
            ]);

            const booksData = await booksResponse.json();
            const authorsData = await authorsResponse.json();
            
            const books = booksData.books;
            const authors = authorsData.authors;

            // Calculate genre distribution
            const genreCounts = {};
            books.forEach(book => {
                const genre = book.genre || 'Uncategorized';
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });

            // Calculate monthly reviews (using releaseDate)
            const monthlyData = {
                'Jan': 0, 'Feb': 0, 'Mar': 0, 
                'Apr': 0, 'May': 0, 'Jun': 0
            };
            
            books.forEach(book => {
                const month = new Date(book.releaseDate).toLocaleString('en-US', { month: 'short' });
                if (month in monthlyData) {
                    monthlyData[month]++;
                }
            });

            // Assuming popular books and authors are the first 5 from the fetched data
            const popularBooks = books.slice(0, 5);
            const popularAuthors = authors.slice(0, 5);

            setDashboardStats({
                totalBooks: booksData.totalItems,
                totalAuthors: authorsData.totalItems,
                activeUsers: authors.length * 15, // Multiplier for active users
                totalReviews: books.length * 20, // Multiplier for total reviews
                popularBooks: popularBooks,
                popularAuthors: popularAuthors,
                monthlyReviews: {
                    labels: Object.keys(monthlyData),
                    data: Object.values(monthlyData)
                },
                booksByGenre: {
                    labels: Object.keys(genreCounts),
                    data: Object.values(genreCounts)
                },
                ratingDistribution: {
                    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                    data: [
                        books.filter(book => book.rating >= 1 && book.rating < 2).length,
                        books.filter(book => book.rating >= 2 && book.rating < 3).length,
                        books.filter(book => book.rating >= 3 && book.rating < 4).length,
                        books.filter(book => book.rating >= 4 && book.rating < 5).length,
                        books.filter(book => book.rating === 5).length
                    ]
                }
            });

            // Update books table data dynamically
            setBooks(books.map(book => ({
                title: book.title,
                author: book.author.name,
                genre: book.genre || 'Uncategorized',
                rating: book.rating || 0,
                sales: book.sales || 0
            })));

            // Update authors table data dynamically
            const authorStats = authors.map(author => {
                const authorBooks = books.filter(book => book.author._id === author._id);
                const totalSales = authorBooks.reduce((sum, book) => sum + (book.sales || 0), 0);
                const avgRating = authorBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / authorBooks.length || 0;

                return {
                    name: author.name,
                    books: authorBooks.length,
                    totalSales: totalSales,
                    avgRating: avgRating.toFixed(1)
                };
            });

            setAuthors(authorStats);

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    const handlePageChangeBooks = (pageNumber) => {
        setCurrentPageBooks(pageNumber);
    };

    const handlePageChangeAuthors = (pageNumber) => {
        setCurrentPageAuthors(pageNumber);
    };

    // Pagination logic for books
    const indexOfLastBook = currentPageBooks * itemsPerPage;
    const indexOfFirstBook = indexOfLastBook - itemsPerPage;
    const currentBooks = dashboardStats.popularBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPagesBooks = Math.ceil(dashboardStats.popularBooks.length / itemsPerPage);

    // Pagination logic for authors
    const indexOfLastAuthor = currentPageAuthors * itemsPerPage;
    const indexOfFirstAuthor = indexOfLastAuthor - itemsPerPage;
    const currentAuthors = dashboardStats.popularAuthors.slice(indexOfFirstAuthor, indexOfLastAuthor);
    const totalPagesAuthors = Math.ceil(dashboardStats.popularAuthors.length / itemsPerPage);

    return (
        <DashboardContainer>
            <Sidebar>
                <SidebarHeader>
                    <SidebarTitle>Dashboard</SidebarTitle>
                </SidebarHeader>
                <NavItem
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                >
                    <FaChartBar /> Overview
                </NavItem>
                <NavItem
                    active={activeTab === 'manage-books'}
                    onClick={() => setActiveTab('manage-books')}
                >
                    <FaBook /> Manage Books
                </NavItem>
                <NavItem
                    active={activeTab === 'manage-authors'}
                    onClick={() => setActiveTab('manage-authors')}
                >
                    <FaUser /> Manage Authors
                </NavItem>
                <NavItem
                    active={activeTab === 'tables'}
                    onClick={() => setActiveTab('tables')}
                >
                    <FaChartBar /> Tables
                </NavItem>
                <NavItem
                    active={activeTab === 'charts'}
                    onClick={() => setActiveTab('charts')}
                >
                    <FaChartBar /> Charts
                </NavItem>
                <NavItem
                    active={activeTab === 'admin-registration'}
                    onClick={() => setActiveTab('admin-registration')}
                >
                    <FaUserShield /> Admin Registration
                </NavItem>
            </Sidebar>
            <MainContent>
                {activeTab === 'overview' && (
                    <OverviewSection stats={dashboardStats} loading={loading} />
                )}
                {activeTab === 'manage-books' && (
                    <ManageBooks />
                )}
                {activeTab === 'manage-authors' && (
                    <ManageAuthors />
                )}
                {activeTab === 'tables' && (
                    <TablesSection 
                        popularBooks={currentBooks} 
                        popularAuthors={currentAuthors} 
                        totalPagesBooks={totalPagesBooks} 
                        currentPageBooks={currentPageBooks} 
                        handlePageChangeBooks={handlePageChangeBooks}
                        totalPagesAuthors={totalPagesAuthors} 
                        currentPageAuthors={currentPageAuthors} 
                        handlePageChangeAuthors={handlePageChangeAuthors}
                    />
                )}
                {activeTab === 'charts' && (
                    <ChartsSection stats={dashboardStats} loading={loading} />
                )}
                {activeTab === 'admin-registration' && (
                    <AdminRegistrationSection />
                )}
            </MainContent>
        </DashboardContainer>
    );
};
// Section Components
const OverviewSection = ({ stats, loading }) => (
    <Section>
        <SectionTitle>Overview</SectionTitle>
        {loading ? (
            <LoadingSpinner />
        ) : (
            <>
                <StatsGrid>
                    <StatCard>
                        <StatIcon><FaBook /></StatIcon>
                        <StatInfo>
                            <h3>Total Books</h3>
                            <p>{stats.totalBooks}</p>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaUser /></StatIcon>
                        <StatInfo>
                            <h3>Total Authors</h3>
                            <p>{stats.totalAuthors}</p>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaUser /></StatIcon>
                        <StatInfo>
                            <h3>Active Users</h3>
                            <p>{stats.activeUsers}</p>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon><FaStar /></StatIcon>
                        <StatInfo>
                            <h3>Reviews</h3>
                            <p>{stats.totalReviews}</p>
                        </StatInfo>
                    </StatCard>
                </StatsGrid>
                <ChartContainer>
                    <h3>Monthly Reviews Overview</h3>
                    <ChartWrapper>
                        <Line 
                            data={{
                                labels: stats.monthlyReviews.labels,
                                datasets: [{
                                    label: 'Reviews',
                                    data: stats.monthlyReviews.data,
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    tension: 0.4
                                }]
                            }} 
                            options={chartOptions} 
                        />
                    </ChartWrapper>
                </ChartContainer>
            </>
        )}
    </Section>
);

OverviewSection.propTypes = {
    stats: PropTypes.shape({
        totalBooks: PropTypes.number.isRequired,
        totalAuthors: PropTypes.number.isRequired,
        activeUsers: PropTypes.number.isRequired,
        totalReviews: PropTypes.number.isRequired,
        booksByGenre: PropTypes.shape({
            labels: PropTypes.arrayOf(PropTypes.string).isRequired,
            data: PropTypes.arrayOf(PropTypes.number).isRequired
        }).isRequired,
        monthlyReviews: PropTypes.shape({
            labels: PropTypes.arrayOf(PropTypes.string).isRequired,
            data: PropTypes.arrayOf(PropTypes.number).isRequired
        }).isRequired
    }).isRequired,
    loading: PropTypes.bool.isRequired
};

const TablesSection = () => {
    const [popularBooks, setPopularBooks] = useState([]);
    const [popularAuthors, setPopularAuthors] = useState([]);
    const [totalPagesBooks, setTotalPagesBooks] = useState(1);
    const [currentPageBooks, setCurrentPageBooks] = useState(1);
    const [totalPagesAuthors, setTotalPagesAuthors] = useState(1);
    const [currentPageAuthors, setCurrentPageAuthors] = useState(1);

    // Fetch books data
    useEffect(() => {
        fetch(`http://localhost:5000/books?page=${currentPageBooks}`)
            .then(res => res.json())
            .then(data => {
                console.log("Books Data:", data);
                setPopularBooks(data.books);
                setTotalPagesBooks(data.totalPages);
            })
            .catch(error => console.error("Error fetching books:", error));
    }, [currentPageBooks]);

    // Fetch authors data
    useEffect(() => {
        fetch(`http://localhost:5000/authors?page=${currentPageAuthors}`)
            .then(res => res.json())
            .then(data => {
                console.log("Authors Data:", data);
                setPopularAuthors(data.authors);
                setTotalPagesAuthors(data.totalPages);
            })
            .catch(error => console.error("Error fetching authors:", error));
    }, [currentPageAuthors]);

    // Handle pagination
    const handlePageChangeBooks = (page) => {
        if (page >= 1 && page <= totalPagesBooks) {
            setCurrentPageBooks(page);
        }
    };

    const handlePageChangeAuthors = (page) => {
        if (page >= 1 && page <= totalPagesAuthors) {
            setCurrentPageAuthors(page);
        }
    };

    return (
        <Section>
            <SectionTitle>Popular Books and Authors</SectionTitle>
            <TablesContainer>

                {/* Popular Books Table */}
                <TableWrapper>
                    <TableTitle>Popular Books</TableTitle>
                    <Table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Release Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularBooks.length > 0 ? (
                                popularBooks.map((book, index) => (
                                    <tr key={index}>
                                        <td>{book.title}</td>
                                        <td>{book.author.name}</td>
                                        <td>{book.releaseDate}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No popular books available.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    
                    {/* Pagination for Books */}
                    {totalPagesBooks > 1 && (
                        <PaginationContainer>
                            <PaginationButton
                                onClick={() => handlePageChangeBooks(currentPageBooks - 1)}
                                disabled={currentPageBooks === 1}
                            >
                                Prev
                            </PaginationButton>
                            <PageInfo>{currentPageBooks} / {totalPagesBooks}</PageInfo>
                            <PaginationButton
                                onClick={() => handlePageChangeBooks(currentPageBooks + 1)}
                                disabled={currentPageBooks === totalPagesBooks}
                            >
                                Next
                            </PaginationButton>
                        </PaginationContainer>
                    )}
                </TableWrapper>

                {/* Popular Authors Table */}
                <TableWrapper>
                    <TableTitle>Popular Authors</TableTitle>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Nationality</th>
                                <th>Birth Year</th>
                                <th>Death Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularAuthors.length > 0 ? (
                                popularAuthors.map((author, index) => (
                                    <tr key={index}>
                                        <td>{author.name}</td>
                                        <td>{author.nationality}</td>
                                        <td>{author.birthYear}</td>
                                        <td>{author.deathYear || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No popular authors available.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination for Authors */}
                    {totalPagesAuthors > 1 && (
                        <PaginationContainer>
                            <PaginationButton
                                onClick={() => handlePageChangeAuthors(currentPageAuthors - 1)}
                                disabled={currentPageAuthors === 1}
                            >
                                Prev
                            </PaginationButton>
                            <PageInfo>{currentPageAuthors} / {totalPagesAuthors}</PageInfo>
                            <PaginationButton
                                onClick={() => handlePageChangeAuthors(currentPageAuthors + 1)}
                                disabled={currentPageAuthors === totalPagesAuthors}
                            >
                                Next
                            </PaginationButton>
                        </PaginationContainer>
                    )}
                </TableWrapper>
            </TablesContainer>
        </Section>
    );
};

TablesSection.propTypes = {
    popularBooks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.shape({
            name: PropTypes.string.isRequired
        }).isRequired,
        releaseDate: PropTypes.string.isRequired
    })),
    popularAuthors: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        birthYear: PropTypes.number.isRequired,
        deathYear: PropTypes.number,
        nationality: PropTypes.string.isRequired
    })),
    totalPagesBooks: PropTypes.number,
    currentPageBooks: PropTypes.number,
    totalPagesAuthors: PropTypes.number,
    currentPageAuthors: PropTypes.number
};

const ChartsSection = ({ stats, loading }) => {
    // Check if data is available
    const hasData = stats.booksByGenre.data.length > 0 && stats.monthlyReviews.data.length > 0;

    return (
        <Section>
            <SectionTitle>Analytics Charts</SectionTitle>
            {loading ? (
                <LoadingSpinner />
            ) : !hasData ? ( // Check for data availability
                <p>No data available for charts.</p>
            ) : (
                <ChartsGrid>
                    <ChartContainer>
                        <h3>Books by Release Year</h3>
                        <ChartWrapper>
                            <Bar 
                                data={{
                                    labels: stats.booksByGenre.labels,
                                    datasets: [{
                                        label: 'Number of Books',
                                        data: stats.booksByGenre.data,
                                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                    }]
                                }} 
                                options={chartOptions} 
                            />
                        </ChartWrapper>
                    </ChartContainer>
                    <ChartContainer>
                        <h3>Authors by Nationality</h3>
                        <ChartWrapper>
                            <Pie 
                                data={{
                                    labels: stats.monthlyReviews.labels,
                                    datasets: [{
                                        data: stats.monthlyReviews.data,
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.5)',
                                            'rgba(54, 162, 235, 0.5)',
                                            'rgba(255, 206, 86, 0.5)',
                                            'rgba(75, 192, 192, 0.5)',
                                            'rgba(153, 102, 255, 0.5)',
                                        ],
                                    }]
                                }} 
                                options={chartOptions} 
                            />
                        </ChartWrapper>
                    </ChartContainer>
                </ChartsGrid>
            )}
        </Section>
    );
};

ChartsSection.propTypes = {
    stats: PropTypes.shape({
        booksByGenre: PropTypes.shape({
            labels: PropTypes.arrayOf(PropTypes.string).isRequired,
            data: PropTypes.arrayOf(PropTypes.number).isRequired
        }).isRequired,
        monthlyReviews: PropTypes.shape({
            labels: PropTypes.arrayOf(PropTypes.string).isRequired,
            data: PropTypes.arrayOf(PropTypes.number).isRequired
        }).isRequired
    }).isRequired,
    loading: PropTypes.bool.isRequired
};

// Admin Registration Schema
const AdminRegistrationSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .required('Username is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Must contain uppercase, lowercase, number and special character'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    role: Yup.string()
        .oneOf(['admin'], 'Invalid role selected')
        .required('Role is required')
});

const AdminRegistrationSection = () => {
    const initialValues = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form submitted:', values);
            resetForm();
            alert('Registration successful!');
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Section>
            <SectionTitle>Admin Registration</SectionTitle>
            <FormContainer>
                <Formik
                    initialValues={initialValues}
                    validationSchema={AdminRegistrationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, isSubmitting }) => (
                        <StyledForm>
                            <FormGroup>
                                <FormLabel>
                                    <FaUser />
                                    Username
                                </FormLabel>
                                <FormInput
                                    name="username"
                                    type="text"
                                    placeholder="Enter username"
                                    error={touched.username && errors.username}
                                />
                                {touched.username && errors.username && (
                                    <ErrorMessage>{errors.username}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>
                                    <FaEnvelope />
                                    Email
                                </FormLabel>
                                <FormInput
                                    name="email"
                                    type="email"
                                    placeholder="Enter email"
                                    error={touched.email && errors.email}
                                />
                                {touched.email && errors.email && (
                                    <ErrorMessage>{errors.email}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>
                                    <FaLock />
                                    Password
                                </FormLabel>
                                <FormInput
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    error={touched.password && errors.password}
                                />
                                {touched.password && errors.password && (
                                    <ErrorMessage>{errors.password}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>
                                    <FaLock />
                                    Confirm Password
                                </FormLabel>
                                <FormInput
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    error={touched.confirmPassword && errors.confirmPassword}
                                />
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <FormLabel>
                                    <FaUserShield />
                                    Role
                                </FormLabel>
                                <FormSelect
                                    name="role"
                                    error={touched.role && errors.role}
                                >
                                    <option value="admin">Admin</option>
                                </FormSelect>
                                {touched.role && errors.role && (
                                    <ErrorMessage>{errors.role}</ErrorMessage>
                                )}
                            </FormGroup>

                            <SubmitButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Register Admin'}
                            </SubmitButton>
                        </StyledForm>
                    )}
                </Formik>
            </FormContainer>
        </Section>
    );
};

// Chart Options
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                padding: 20,
                font: { size: 12 }
            }
        },
        title: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { drawBorder: false }
        },
        x: {
            grid: { display: false }
        }
    }
};
// Styled Components
const DashboardContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #f8f9fd;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
        flex-direction: column;
    }
`;

const Sidebar = styled.div`
    width: 280px;
    background: linear-gradient(180deg, #2c3e50 0%, #3498db 100%);
    padding: 2rem 1rem;
    color: white;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
    min-height: 100vh;

    @media (max-width: ${BREAKPOINTS.tablet}) {
        width: 100%;
        min-height: auto;
        padding: 1rem;
    }
`;

const SidebarHeader = styled.div`
    margin-bottom: 2.5rem;
    padding: 0 1.25rem;
`;

const SidebarTitle = styled.h1`
    font-size: 1.75rem;
    color: white;
    font-weight: 600;
    letter-spacing: 0.5px;
`;

const NavItem = styled.div`
    padding: 1rem 1.25rem;
    margin: 0.5rem 0;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
    display: flex;
    align-items: center;
    gap: 1rem;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
        padding: 0.75rem 1rem;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateX(5px);
    }

    svg {
        font-size: 1.2rem;
    }
`;

const MainContent = styled.main`
    flex: 1;
    padding: 2rem;
    background-color: #f8f9fd;

    @media (max-width: ${BREAKPOINTS.tablet}) {
        padding: 1rem;
    }
`;

const Section = styled.section`
    background-color: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-weight: 600;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: ${BREAKPOINTS.laptop}) {
        grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: ${BREAKPOINTS.mobile}) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease;

    @media (max-width: ${BREAKPOINTS.mobile}) {
        padding: 1rem;
    }

    &:hover {
        transform: translateY(-5px);
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #3498db;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
`;

const StatInfo = styled.div`
    h3 {
        color: #64748b;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
    }
    
    p {
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }
`;

const TablesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const TableWrapper = styled.div`
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    overflow-x: auto;

    @media (max-width: ${BREAKPOINTS.tablet}) {
        padding: 1rem;
    }
`;

const TableTitle = styled.h3`
    color: #1e293b;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        color: #3498db;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
    
    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;

        @media (max-width: ${BREAKPOINTS.tablet}) {
            padding: 0.75rem;
        }
    }
    
    th {
        color: #64748b;
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    td {
        color: #1e293b;
        font-size: 0.875rem;
    }
    
    tbody tr:hover {
        background-color: #f8fafc;
    }
`;

const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    
    @media (max-width: ${BREAKPOINTS.tablet}) {
        padding: 1rem;
    }
    
    h3 {
        color: #1e293b;
        font-size: 1.1rem;
        margin-bottom: 1rem;
        text-align: center;

        @media (max-width: ${BREAKPOINTS.mobile}) {
            font-size: 1rem;
        }
    }
`;

const ChartWrapper = styled.div`
    height: 300px;
    width: 100%;
`;

const FormContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    @media (max-width: ${BREAKPOINTS.mobile}) {
        padding: 1rem;
    }
`;

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const FormLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;

    svg {
        color: #3498db;
    }
`;

const FormInput = styled.input`
    padding: 0.75rem 1rem;
    border: 1px solid ${props => props.error ? '#ef4444' : '#e2e8f0'};
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.error ? '#ef4444' : '#3498db'};
        box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
    }
`;

const FormSelect = styled.select`
    padding: 0.75rem 1rem;
    border: 1px solid ${props => props.error ? '#ef4444' : '#e2e8f0'};
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    background-color: white;

    &:focus {
        outline: none;
        border-color: ${props => props.error ? '#ef4444' : '#3498db'};
        box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 152, 219, 0.1)'};
    }
`;

const ErrorMessage = styled.div`
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
    padding: 1rem;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 0.5rem;
    flex-wrap: wrap;

    @media (max-width: ${BREAKPOINTS.mobile}) {
        gap: 0.5rem;
    }
`;

const PaginationButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: ${props => props.disabled ? '#e2e8f0' : '#3498db'};
    color: ${props => props.disabled ? '#64748b' : 'white'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.3s ease;
    min-width: 100px;

    @media (max-width: ${BREAKPOINTS.mobile}) {
        min-width: 80px;
        padding: 0.4rem 0.8rem;
        font-size: 0.875rem;
    }
`;

const PageInfo = styled.span`
    color: #64748b;
    font-size: 0.875rem;
`;

const Button = styled.button`
    background-color: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`;

// Exporting Styled Components
export {
    DashboardContainer,
    Sidebar,
    SidebarHeader,
    SidebarTitle,
    NavItem,
    MainContent,
    Section,
    SectionTitle,
    StatsGrid,
    StatCard,
    StatIcon,
    StatInfo,
    TablesContainer,
    TableWrapper,
    TableTitle,
    Table,
    ChartsGrid,
    ChartContainer,
    ChartWrapper,
    FormContainer,
    StyledForm,
    FormGroup,
    FormLabel,
    FormInput,
    SubmitButton,
    LoadingSpinner,
    PaginationContainer,
    PaginationButton,
    PageInfo,
    Button
};

export default Dashboard;