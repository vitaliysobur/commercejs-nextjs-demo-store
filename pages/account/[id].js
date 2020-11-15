import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import commerce from '../../lib/commerce';
import Head from 'next/head';
import Root from '../../components/common/Root';
import Footer from '../../components/common/Footer';
import moment from 'moment';
import { useSelector } from 'react-redux'

export default function SingleOrderPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const customer = useSelector(state => state.customer)

  useEffect(() => {
    const fetchOrderById = async (id) => {
      try {
        const order = await commerce.customer.getOrder(id, customer.id);

        setLoading(false);
        setData(order.data);
      } catch (err) {
        setLoading(false);
        setError(err?.message);
      }
    };

    fetchOrderById(id);
  }, [id]);

  /**
   * Create thumbnail if available
   */
  const ImageThumb = ({ image: data }) => {
    if (!data.media) {
      return null;
    }

    return (
      <img className="img-thumbnail h-72 mr-4" alt={data.product_name} src={data.media.source}></img>
    )
  }

  /**
   * Create the billing card
   */
  const BillingAddress = ({ address: data }) => {
    if (data.length === 0) {
      return null;
    }

    return (
      <div>
        <h5>Billing address</h5>
        <div className="card p-2">
          <div>
            <div><strong>{ data.name }</strong></div>
            <div>{ data.street }</div>
            <div>{`${ data.town_city}, ${ data.county_state }`}</div>
            <div>{`${ data.country}, ${ data.postal_zip_code }`}</div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Create the shipping card
   */
  const ShippingAddress = ({ address: data }) => {
    if (data.length === 0) {
      return null;
    }

    return (
      <div>
        <h5>Shipping address</h5>
        <div className="card p-2">
          <div>
            <div><strong>{ data.name }</strong></div>
            <div>{ data.street }</div>
            <div>{`${ data.town_city}, ${ data.county_state }`}</div>
            <div>{`${ data.country}, ${ data.postal_zip_code }`}</div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Create error/loading page
   */
  const TemplatePage = ({ page: data }) => {
    return (
    <Root>
      <Head>
        <title>commerce</title>
      </Head>
      <div className="py-5 my-5 text-center">
        <h4 className="mt-4">{ data.message }</h4>
      </div>
      <Footer />
    </Root>
  )}

  /**
   * Render a page if an error occured
   */
  if (error) {
    return <TemplatePage page={ {message: 'Sorry something went wrong.'} } />
  }

  /**
   * Render loading state
   */
  if (loading) {
    return <TemplatePage page={ {message: 'Loading'} } />
  }

  /**
   * Render a page if no order found
   */
  if (!data) {
    return <TemplatePage page={ {message: 'Sorry we cannot find an order witht that number, if you think this is in error please contact us!'} } />
  }

  /**
   * If no errors, return the order page.
   */
  return (
    <Root>
      <Head>
        <title>{ data.id } | commerce</title>
      </Head>
      <div className="account-container">
          <div className="container">
            <div className="row mt-5 pt-5">
              <div className="col-12">
                <h2 className="font-size-header mb-4 pt-5 text-center">
                  Order: #{ data.id }
                </h2>
                {alert}
              </div>
            </div>
            <div className="row mt-5 pt-5">
              <div className="col-12 col-md-8 col-lg-8">
                <div className="d-flex flex-row justify-content-between">
                  <h5>Items</h5>
                  <small><strong>Ordered On:</strong> { moment.unix(data.created).format('MMM Do Y') }</small>
                </div>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    { data.order.line_items.map((item) => {
                      return (
                        <tr key={ item.id }>
                          <td>
                            <ImageThumb image={item}/>
                            { item.product_name }
                          </td>
                          <td>{ item.price.formatted_with_symbol }</td>
                          <td>{ item.quantity }</td>
                          <td>{ item.line_total.formatted_with_symbol }</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tbody>
                    <tr>
                      <td colSpan="4">
                        Subtotal
                        <span className="float-right">
                          { data.order.subtotal.formatted_with_symbol}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4">
                        Shipping
                        <span className="float-right">
                          { data.order.shipping.price.formatted_with_symbol}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4">
                        Tax
                        <span className="float-right">
                          { data.order.tax.amount.formatted_with_symbol}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4">
                        <strong>
                          Total
                          <span className="float-right">
                            { data.order.total.formatted_with_symbol}
                          </span>
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-12 col-md-4 col-lg-4 row-content">
                <BillingAddress address={data.billing} />
                <ShippingAddress address={data.shipping} />
              </div>
            </div>
          </div>
        </div>
      <Footer />
    </Root>
  );
}
