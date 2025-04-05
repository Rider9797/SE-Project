import React from 'react';
import SignUpForm from './Signup';
import { Container, Row, Col } from 'react-bootstrap';

const SignUpPage: React.FC = () => {
  return (
    <Container fluid style={{ minHeight: '100vh', backgroundColor: '#141414' }}>
      <Row
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        <Col xs={12} md={6} lg={4}>
          {/* You can add a logo above the form if desired */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img src="/vite.svg" alt="Logo" style={{ width: 100 }} />
          </div>
          <SignUpForm />
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpPage;
