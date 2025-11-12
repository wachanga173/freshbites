import './Cart.css'

export default function Cart({ items, onRemove, onCheckout, onUpdateQuantity }) {
  const safeItems = Array.isArray(items) ? items : []
  const total = safeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = safeItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Order</h2>
        <span className="item-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

  {safeItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <span className="cart-icon">🛒</span>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {safeItems.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-price">KSH {item.price.toFixed(0)}</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(idx, -1)}
                    >−</button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(idx, 1)}
                    >+</button>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => onRemove(idx)}
                  >×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="total-amount">KSH {total.toFixed(0)}</span>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
