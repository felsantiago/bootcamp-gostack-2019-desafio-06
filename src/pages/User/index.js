import React, { Component } from 'react';
import { TouchableHighlight } from 'react-native';

import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  ActivityIndicatorStyled,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  perPage = 5;

  state = {
    stars: [],
    loading: false,
    refreshing: false,
    page: 1,
    user: {},
  };

  async componentDidMount() {
    this.setState({ loading: true });
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ user });
    this.startList();
  }

  startList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const response = await api.get(
      `/users/${user.login}/starred?per_page=${this.perPage}&page=1`
    );
    this.setState({ page: 1, stars: response.data, loading: false, user });
  };

  loadMore = async () => {
    const { stars, page, user } = this.state;
    const newPage = page + 1;
    const response = await api.get(
      `/users/${user.login}/starred?per_page=${this.perPage}&page=${newPage}`
    );
    this.setState({ page: newPage, stars: [...stars, ...response.data] });
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('WebviewRepo', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicatorStyled color="#7159c1" />
        ) : (
          <Stars
            onRefresh={this.startList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2} // Carrega mais itens quando chegar em 20% do fim
            onEndReached={this.loadMore} // Função que carrega mais itens
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <TouchableHighlight
                    underlayColor="#ffffff00"
                    onPress={() => this.handleNavigate(item)}
                  >
                    <Title>{item.name}</Title>
                  </TouchableHighlight>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
