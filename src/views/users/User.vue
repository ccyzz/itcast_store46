<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="searchArea">
      <el-col :span="24">
        <!-- 搜索功能
          1，绑定搜索文本框
          2，给搜索按钮绑定事件
        -->
        <el-input placeholder="请输入内容" v-model="searchValue" clearable  class="searchInput">
            <el-button slot="append" @click="handleSearch" icon="el-icon-search"></el-button>
        </el-input>
        <el-button type="success" plain  @click="addUserdialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      stripe
      border
      :data="list"
      style="width: 100%">
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="username"
        label="姓名"
        width="100">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="180">
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话">
      </el-table-column>
      <el-table-column
       label="创建日期">
        <template slot-scope="scope">
          {{ scope.row.create_time | fmtDate('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态" width="100">
      <template slot-scope="scope">
         <!-- scope.row 就是当前行绑定的数据对象 -->
          <el-switch
            @change="handleSwitch(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949">
         </el-switch>
      </template>
      </el-table-column>
      <el-table-column
       label="操作">
        <template slot-scope="scope">
          <el-button plain size="mini" type="primary" icon="el-icon-edit" ></el-button>
          <el-button @click="handleDel(scope.row.id)" plain size="mini" type="danger" icon="el-icon-delete" ></el-button>
          <el-button plain size="mini" type="success" icon="el-icon-check" ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 添加用户的弹出框 -->
    <el-dialog title="添加用户" :visible.sync="addUserdialogVisible">
      <el-form
        label-width="100px"
        :model="formData">
        <el-form-item label="用户名">
          <el-input v-model="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.mobile" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserdialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
export default {
  data() {
    return {
      // 用户列表
      list: [],
      // true显示正在加载，false的时候不显示
      loading: true,
      pagenum: 1,
      pagesize: 5,
      total: 0,
      searchValue: '',
      // 控制添加用户的对话框显示或隐藏
      addUserdialogVisible: false,
      // 绑定表单数据
      formData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      }
    };
  },
  created() {
    // 发送请求，获取数据
    this.loadData();
  },
  methods: {
    // 分页
    handleSizeChange(val) {
      // 每页数据改变的时候
      this.pagesize = val;
      this.loadData();
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      // 页码改变的时候
      this.pagenum = val;
      this.loadData();
      console.log(`当前页: ${val}`);
    },
    // 发送异步请求，获取数据
    async loadData() {
      // 发送异步请求之前
      this.loading = true;
      // 发送请求之前获取token
      const token = sessionStorage.getItem('token');
      // 在请求头中设置token
      this.$http.defaults.headers.common['Authorization'] = token;
      const res = await this.$http.get(`users?pagenum=${this.pagenum}&pagesize=${this.pagesize}&query=${this.searchValue}`);
      // 异步请求结束
      this.loading = false;
      const data = res.data;

      const {meta: {msg, status}} = data;
      if (status === 200) {
        const {data: {users, total}} = data;
        // console.log(users);
        this.list = users;
        // 获取总条数
        this.total = total;
      } else {
        this.$message.error(msg);
      }
    },
    // 搜索事件
    handleSearch() {
      this.loadData();
    },
    // 用户状态事件
    // 当开关的状态发生改变时
    async handleSwitch(user) {
      const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`);
      const data = res.data;
      // console.log(data); {data: {}, meta: {}}
      const {meta: {status, msg}} = data;
      if (status === 200) {
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    },
    // 删除
    async handleDel(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$http.delete(`users/${id}`);
        const data = res.data;
        const {meta: {status, msg}} = data;
        if (status === 200) {
          // 如果删除成功，重新加载数据
          this.pagenum = 1;
          this.loadData();
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        } else {
          this.message.error(msg);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    }
  }
};
</script>

<style>
.box-card {
  height: 100%;
}

.searchArea {
  margin-top: 10px;
  margin-bottom: 10px;
}

.searchArea .searchInput {
  width: 350px;
}
</style>
