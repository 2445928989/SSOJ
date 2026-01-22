package com.ssoj.backend.dao;

import com.ssoj.backend.entity.SampleCase;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SampleCaseMapper {
    List<SampleCase> findByProblemId(Long problemId);

    void insert(SampleCase sampleCase);

    void deleteByProblemId(Long problemId);

    void batchInsert(@Param("samples") List<SampleCase> samples);
}
