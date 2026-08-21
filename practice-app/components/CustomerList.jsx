import React from 'react';

export function CustomerList({ customers }) {
  if (!customers.length) {
    return <p>No customers yet.</p>;
  }
  return (
    <ul className="customer-list">
      {customers.map((c) => (
        <li key={c.id}>
          {c.name} &lt;{c.email}&gt;
        </li>
      ))}
    </ul>
  );
}
