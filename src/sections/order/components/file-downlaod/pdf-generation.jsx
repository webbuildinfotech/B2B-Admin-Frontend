import { fCurrency } from "src/utils/format-number";
import logo from '../../../../assets/logos/techno.png'

export const generatePrintableContent = (data) => `
 <html>
  <head>
    <title>Orders</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .header img {
        max-width: 150px;
      }
      .header .company-details {
        text-align: right;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 12px;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        text-align: center;
      }
      .totals {
        text-align: right;
        font-weight: bold;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        border-top: 1px solid #000;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src=${logo} alt="Company Logo" />
      <div class="company-details">
        <h1>Sales Orders</h1>
        <p>Company Name: RG Techno</p>
        <p>State: Karnataka, Code: 29</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Order No</th>
          <th>Buyer Details</th>
          <th>Shipping Address</th>
          <th>Product Details</th>
          <th>Total Quantity</th>
          <th>Discount</th>
          <th>Final Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (item) => `
              <tr>
                <td>${item.orderNo}</td>
                <td>
                  ${item.user?.name || 'N/A'}<br />
                  ${item.user?.email || 'N/A'}
                </td>
                <td>
                  ${item.user?.address || 'N/A'},<br />
                  ${item.user?.state || ''}, ${item.user?.country || ''} - ${item.user?.pincode || ''}
                </td>
                <td>
                  <ul>
                    ${item.orderItems
                      .map(
                        (orderItem) => `
                          <li>
                            ${orderItem.product?.itemName || 'N/A'} - 
                            Qty: ${orderItem.quantity}, 
                            Price: ${fCurrency(orderItem.product?.sellingPrice) || 'N/A'}
                          </li>
                        `
                      )
                      .join('')}
                  </ul>
                </td>
                <td>${item.totalQuantity}</td>
                <td>${item.discount}%</td>
                <td>${fCurrency(item.finalAmount)}</td>
                <td>${item.status}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>This is a computer-generated document. No signature required.</p>
    </div>
  </body>
</html>
`;
