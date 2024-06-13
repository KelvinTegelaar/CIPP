import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { CButton, CCardHeader, CNav, CNavItem, CNavLink, CRow, CCol } from '@coreui/react'
import { CippPage } from 'src/components/layout'

export default class CippWizard extends React.Component {
  static propTypes = {
    wizardTitle: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    initialValues: PropTypes.any,
    onPageChange: PropTypes.func,
    nextPage: PropTypes.func,
    previousPage: PropTypes.func,
    hideSubmit: PropTypes.bool,
  }

  static defaultProps = {
    initialValues: {},
  }

  static Page = ({ children }) => children

  constructor(props) {
    super(props)
    this.state = {
      page: 0,
      values: props.initialValues,
      wizardTitle: props.wizardTitle,
      hideSubmit: props.hideSubmit,
    }
  }

  next = (values) =>
    this.setState((state) => ({
      page: Math.min(state.page + 1, this.props.children.length - 1),
      values,
    }))

  previous = () =>
    this.setState((state) => ({
      page: Math.max(state.page - 1, 0),
    }))

  /**
   * NOTE: Both validate and handleSubmit switching are implemented
   * here because 🏁 Redux Final Form does not accept changes to those
   * functions once the form has been defined.
   */
  validate = (values) => {
    const activePage = React.Children.toArray(this.props.children)[this.state.page]
    return activePage.props.validate ? activePage.props.validate(values) : {}
  }

  handleSubmit = (values) => {
    const { children, onSubmit } = this.props
    const { page } = this.state
    const isLastPage = page === React.Children.count(children) - 1
    if (isLastPage) {
      return onSubmit(values)
    } else {
      this.next(values)
    }
  }

  render() {
    const { children } = this.props
    const { page, values, wizardTitle, hideSubmit } = this.state
    const activePage = React.Children.toArray(children)[page]
    const isLastPage = page === React.Children.count(children) - 1

    return (
      <CippPage title={wizardTitle} tenantSelector={false} wizard={true}>
        <CRow className="row justify-content-center cipp-wizard">
          <CCol xxl={12}>
            <CCardHeader className="bg-transparent mb-4">
              <CNav variant="pills" role="tablist" className="nav-justified nav-wizard">
                {React.Children.map(children, ({ props: { description, title } }, idx) => (
                  <CNavItem key={`wizard-nav-item-${idx}`} style={{ cursor: 'pointer' }}>
                    <CNavLink active={idx === page}>
                      <div className="wizard-step-icon">{idx + 1}</div>
                      <div className="wizard-step-text">
                        <div className="wizard-step-text-name">{title}</div>
                        <div className="wizard-step-text-details">{description}</div>
                      </div>
                    </CNavLink>
                    <br></br>
                  </CNavItem>
                ))}
              </CNav>
            </CCardHeader>
            <Form initialValues={values} validate={this.validate} onSubmit={this.handleSubmit}>
              {({ handleSubmit, submitting, values }) => (
                <>
                  <form onSubmit={handleSubmit}>
                    {activePage}
                    <div className="d-flex justify-content-between">
                      {page > 0 && (
                        <CButton className="me-auto" type="button" onClick={this.previous}>
                          « Previous
                        </CButton>
                      )}
                      {!isLastPage && (
                        <CButton className="ms-auto" type="submit">
                          Next »
                        </CButton>
                      )}
                      {isLastPage && !hideSubmit && (
                        <>
                          <CButton type="submit" disabled={submitting}>
                            Submit
                          </CButton>
                        </>
                      )}
                    </div>
                  </form>
                </>
              )}
            </Form>
          </CCol>
        </CRow>
      </CippPage>
    )
  }
}

CippWizard.Page.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
}
