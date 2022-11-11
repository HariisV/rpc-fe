import { useEffect, useMemo, useState } from 'react';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';

import { Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { FormattedMessage } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { openSnackbar } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import HeaderCustom from 'components/@extended/HeaderPageCustom';

let paramFacilityList = {};

const FacilityList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // setFacilityData
  const [getFacilityData] = useState({
    data: [
      { id: 1, locationName: 'RPC Condet', usageCapacity: 5, facilityVariant: 6, totalUnit: 11 },
      { id: 2, locationName: 'RPC Kelapa Gading', usageCapacity: 2, facilityVariant: 2, totalUnit: 10 },
      { id: 3, locationName: 'RPC Tanjung Barat', usageCapacity: 6, facilityVariant: 4, totalUnit: 20 },
      { id: 4, locationName: 'RPC BSD', usageCapacity: 5, facilityVariant: 10, totalUnit: 20 },
      { id: 5, locationName: 'RPC Sawangan', usageCapacity: 0, facilityVariant: 0, totalUnit: 0 }
    ],
    totalPagination: 1
  });
  const [selectedRow, setSelectedRow] = useState([]);
  const [locationList] = useState([
    { label: 'RPC Condet', value: 'condet' },
    { label: 'RPC Kelapa Gading', value: 'kelapa-gading' }
  ]);
  const [selectedFilterLocation, setFilterLocation] = useState(null);

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.codeLocation);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/location/facilities/${getId}`}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="usage-capacity" />, accessor: 'usageCapacity' },
      { Header: <FormattedMessage id="facility-variant" />, accessor: 'facilityVariant' },
      { Header: <FormattedMessage id="amount-unit" />, accessor: 'totalUnit' }
    ],
    []
  );

  const onOrderingChange = (event) => {
    paramFacilityList.orderValue = event.order;
    paramFacilityList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramFacilityList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramFacilityList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (e, val) => {
    const getValue = val ? val.value : null;
    paramFacilityList.locationCode = getValue;
    setFilterLocation(locationList.find((dt) => dt.value === getValue) || null);
    fetchData();
  };

  const onClickAdd = () => {
    navigate('/location/facilities/add', { replace: true });
  };

  const onDeleteFacility = async () => {
    const resp = await axios.delete('facility', {
      data: { id: selectedRow }
    });

    if (resp.status === 200 && resp.data.result === 'success') {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Success Delete facility',
          variant: 'alert',
          alert: { color: 'success' },
          duration: 2000,
          close: true
        })
      );
      clearParamFetchData();
      fetchData();
    }
  };

  const onExport = async () => {
    const resp = await axios.get('exportfacility', {
      responseType: 'blob'
    });

    let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
    let downloadUrl = URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = downloadUrl;
    a.download = 'facility';
    document.body.appendChild(a);
    a.click();
  };

  async function fetchData() {
    const getData = await axios.get('fasilitas', {
      params: {
        rowPerPage: paramFacilityList.rowPerPage,
        goToPage: paramFacilityList.goToPage,
        orderValue: paramFacilityList.orderValue,
        orderColumn: paramFacilityList.orderColumn,
        locationCode: paramFacilityList.locationCode
      }
    });
    console.log('getData', getData);
    // setFacilityData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramFacilityList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', locationCode: '' };
    setFilterLocation(null);
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="facilities" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Autocomplete
                id="filterLocation"
                options={locationList}
                value={selectedFilterLocation}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(event, value) => onFilterLocation(event, value)}
                renderInput={(params) => <TextField {...params} label="Filter location" />}
              />
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'}>
                <Button variant="contained" startIcon={<VerticalAlignTopOutlined />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="add-facility" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getFacilityData.data}
              totalPagination={getFacilityData.totalPagination}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>

          {selectedRow.length > 0 && (
            <Stack
              // direction={matchDownSM ? 'column' : 'row'}
              style={{ marginBottom: '20px' }}
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={onDeleteFacility}>
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
          )}
        </ScrollX>
      </MainCard>
    </>
  );
};

export default FacilityList;
