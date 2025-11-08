import './PaymentResult.css'

export default function PaymentCancel() {
  const goToHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        <div className="cancelled">
          <div className="cancel-icon">⚠</div>
          <h2>Payment Cancelled</h2>
          <p>You have cancelled the payment process</p>
          <button className="home-btn" onClick={goToHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
