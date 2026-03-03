import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useTheme } from '@mui/material/styles';

const COL1_WIDTH = 60;
const COLN_WIDTH = (100 - COL1_WIDTH) / 3;

const useStyles = () => {
  const theme = useTheme();

  return useMemo(() => {
    return StyleSheet.create({
      page: {
        backgroundColor: '#FFFFFF',
        padding: 24
      },
      h4: {
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.5
      },
      subtitle2: {
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0,
        lineHeight: 1.57
      },
      body2: {
        fontSize: 10,
        lineHeight: 1.47
      },
      h6: {
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.6
      },
      gutterBottom: {
        marginBottom: 4
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
      },
      status: {
        textTransform: 'uppercase',
        color: 'rgba(236, 76, 71, 1)'
      },
      details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12
      },
      dates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 36,
        marginTop: 48
      },
      notes: {
        marginTop: 32
      },
      table: {
        display: 'flex',
        width: 'auto',
        border: '1px solid #E1E3EA',
        borderRadius: 6
      },
      tableHeader: {
        backgroundColor: 'rgba(243, 244, 247, 1)'
      },
      tableBody: {},
      tableRow: {
        borderBottomWidth: 1,
        borderColor: '#EEEEEE',
        borderStyle: 'solid',
        flexDirection: 'row'
      },
      tableCell1: {
        padding: 6,
        width: `${COL1_WIDTH}%`,
        justifyContent: 'center'
      },
      tableCellN: {
        padding: 6,
        width: `${COLN_WIDTH}%`,
        justifyContent: 'center'
      }
    });
  }, []);
};

export const InvoicePdfDocument = (props) => {
  const { invoice } = props;
  const styles = useStyles();

  const lineItems = invoice.lineItems || [];
  const dueDate = format(invoice.dueDate, 'dd MMM yyyy');
  const issueDate = format(invoice.issueDate, 'dd MMM yyyy');
  const taxAmount = numeral(invoice.taxAmount).format(`${invoice.currency}0,0.00`);
  const totalAmount = numeral(invoice.totalAmount).format(`${invoice.currency}0,0.00`);

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.h4}>
              {invoice.ref}
            </Text>
          </View>
          <View>
            <Text style={[styles.h4, styles.status]}>
              {invoice.status}
            </Text>
          </View>
        </View>
        <View style={styles.details}>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>
              Invoice to
            </Text>
            <Text style={styles.body2}>
              Acme LTD GB54423345
            </Text>
            <Text style={styles.body2}>
              340 Lemon St. #5554
            </Text>
            <Text style={styles.body2}>
              Spring Valley, California
            </Text>
            <Text style={styles.body2}>
              United States
            </Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>
              Invoice for
            </Text>
            <Text style={styles.body2}>
              Natalie Rusell
            </Text>
            <Text style={styles.body2}>
              3845 Salty Street
            </Text>
            <Text style={styles.body2}>
              Salt Lake City
            </Text>
            <Text style={styles.body2}>
              United States
            </Text>
          </View>
        </View>
        <View style={styles.dates}>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>
              Invoice Date
            </Text>
            <Text style={styles.body2}>
              {dueDate}
            </Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>
              Due Date
            </Text>
            <Text style={styles.body2}>
              {issueDate}
            </Text>
          </View>
        </View>
        <View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableRow}>
                <View style={[styles.h6, styles.tableCell1]}>
                  <Text>
                    Description
                  </Text>
                </View>
                <View style={[styles.h6, styles.tableCellN]}>
                  <Text>
                    Qty
                  </Text>
                </View>
                <View style={[styles.h6, styles.tableCellN]}>
                  <Text>
                    Total
                  </Text>
                </View>
                <View style={[styles.h6, styles.tableCellN]}>
                  <Text>
                    Tax
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.tableBody}>
              {lineItems.map((lineItem, index) => {
                const subtotalAmount = numeral(lineItem.subtotalAmount).format(`${lineItem.currency}0,0.00`);
                const totalAmount = numeral(lineItem.totalAmount).format(`${lineItem.currency}0,0.00`);

                return (
                  <View
                    style={styles.tableRow}
                    key={index}
                  >
                    <View style={styles.tableCell1}>
                      <Text style={styles.body2}>
                        {lineItem.name}
                      </Text>
                      <Text style={styles.body2}>
                        {lineItem.unitAmount}
                      </Text>
                    </View>
                    <View style={styles.tableCellN}>
                      <Text style={styles.body2}>
                        {lineItem.quantity}
                      </Text>
                    </View>
                    <View style={styles.tableCellN}>
                      <Text style={styles.body2}>
                        {subtotalAmount}
                      </Text>
                    </View>
                    <View style={styles.tableCellN}>
                      <Text style={styles.body2}>
                        {totalAmount}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <View style={styles.tableRow}>
                <View style={styles.tableCell1} />
                <View style={styles.tableCellN} />
                <View style={styles.tableCellN} />
                <View style={styles.tableCellN}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.body2, { marginRight: 8 }]}>
                      Tax
                    </Text>
                    <Text style={styles.body2}>
                      {taxAmount}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell1} />
                <View style={styles.tableCellN} />
                <View style={styles.tableCellN} />
                <View style={styles.tableCellN}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.body2, { marginRight: 8 }]}>
                      Total
                    </Text>
                    <Text style={styles.subtitle2}>
                      {totalAmount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.notes}>
          <Text style={[styles.subtitle2, styles.gutterBottom]}>
            Notes
          </Text>
          <Text style={styles.body2}>
            {invoice.note}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

InvoicePdfDocument.propTypes = {
  invoice: PropTypes.object.isRequired
};
