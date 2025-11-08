import './MenuItem.css'

export default function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item-card">
      {item.image && (
        <div className="item-image">
          <img src={item.image} alt={item.name} loading="lazy" />
        </div>
      )}
      <div className="item-details">
        <div className="item-content">
          <h3 className="item-name">{item.name}</h3>
          {item.description && (
            <p className="item-description">{item.description}</p>
          )}
          <p className="item-price">KSH {item.price.toFixed(0)}</p>
        </div>
        <button className="add-btn" onClick={() => onAddToCart(item)}>
          <span className="plus-icon">+</span> Add
        </button>
      </div>
    </div>
  )
}
